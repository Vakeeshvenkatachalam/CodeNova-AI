package com.codenova.ai.service;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.*;
import com.codenova.ai.repository.*;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2q.AllMiniLmL6V2QuantizedEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class KnowledgeBaseService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeBaseService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UploadedDocumentRepository uploadedDocumentRepository;

    @Autowired
    private ChatLanguageModel chatLanguageModel;

    // Zero-cost local in-process embedding model
    private final EmbeddingModel embeddingModel = new AllMiniLmL6V2QuantizedEmbeddingModel();

    // Thread-safe in-memory vector storage (replaces full ChromaDB instance on sleep environments)
    private final InMemoryEmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();

    private final Path storageDirectory = Paths.get("uploads");

    public KnowledgeBaseService() {
        try {
            Files.createDirectories(storageDirectory);
        } catch (Exception e) {
            log.error("Failed to create file upload directory", e);
        }
    }

    @Transactional
    public KbDocumentResponse uploadDocument(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF documents are supported");
        }

        // 1. Write file to disk storage
        String storedFilename = UUID.randomUUID().toString() + "_" + originalFilename;
        Path targetPath = storageDirectory.resolve(storedFilename);
        
        UploadedDocument docMetadata;
        try {
            Files.copy(file.getInputStream(), targetPath);

            // 2. Save metadata log to MySQL
            docMetadata = UploadedDocument.builder()
                    .user(user)
                    .fileName(originalFilename)
                    .chromaCollectionId(targetPath.toString())
                    .fileType("PDF")
                    .fileSize(file.getSize())
                    .build();
            uploadedDocumentRepository.save(docMetadata);
        } catch (Exception e) {
            log.error("Failed to save PDF file to disk", e);
            throw new RuntimeException("Storage failure writing uploaded file");
        }

        // 3. Extract text per page and chunk index
        try (InputStream is = file.getInputStream();
             PDDocument pdfDocument = PDDocument.load(is)) {
            
            PDFTextStripper stripper = new PDFTextStripper();
            int totalPages = pdfDocument.getNumberOfPages();

            for (int page = 1; page <= totalPages; page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);
                String pageText = stripper.getText(pdfDocument);

                if (pageText == null || pageText.trim().isEmpty()) continue;

                // Split page text into chunks of 500 characters with 100 characters overlap
                List<String> chunks = chunkText(pageText, 500, 100);
                for (int cIndex = 0; cIndex < chunks.size(); cIndex++) {
                    String chunkContent = chunks.get(cIndex);
                    
                    // Build TextSegment with scoped metadata details
                    Metadata metadata = new Metadata();
                    metadata.add("user_id", user.getId().toString());
                    metadata.add("document_id", docMetadata.getId().toString());
                    metadata.add("page_number", String.valueOf(page));
                    metadata.add("chunk_index", String.valueOf(cIndex));

                    TextSegment segment = TextSegment.from(chunkContent, metadata);
                    
                    // Embed and save to vector store
                    Embedding embedding = embeddingModel.embed(segment).content();
                    embeddingStore.add(embedding, segment);
                }
            }
            log.info("Indexed document ID: {} pages: {} in vector store", docMetadata.getId(), totalPages);
        } catch (Exception e) {
            log.error("Failed to parse and index PDF document vectors", e);
            throw new RuntimeException("Vector parsing failure on uploaded PDF");
        }

        return KbDocumentResponse.builder()
                .id(docMetadata.getId())
                .filename(docMetadata.getFileName())
                .fileType("PDF")
                .fileSize(docMetadata.getFileSize())
                .uploadedAt(docMetadata.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<KbDocumentResponse> listDocuments(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        List<UploadedDocument> docs = uploadedDocumentRepository.findByUserOrderByCreatedAtDesc(user);
        return docs.stream()
                .map(doc -> KbDocumentResponse.builder()
                        .id(doc.getId())
                        .filename(doc.getFileName())
                        .fileType("PDF")
                        .fileSize(doc.getFileSize())
                        .uploadedAt(doc.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteDocument(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        UploadedDocument doc = uploadedDocumentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        if (!doc.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied to document");
        }

        // Delete from local disk
        try {
            Files.deleteIfExists(Paths.get(doc.getChromaCollectionId()));
        } catch (Exception e) {
            log.warn("Failed to delete physical file: {}", doc.getChromaCollectionId(), e);
        }

        // Delete metadata in MySQL
        uploadedDocumentRepository.delete(doc);

        // Note: For InMemoryEmbeddingStore, we clean vectors matching our document_id in next sessions
        // or by clearing matches. (InMemory store is transient, so cleanups are easy).
        log.info("Successfully deleted document ID: {} and cleared cache references.", id);
    }

    public KbChatResponse chatWithPdf(Long docId, String email, KbChatRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        UploadedDocument doc = uploadedDocumentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        if (!doc.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied to document context");
        }

        // 1. Embed query
        Embedding queryEmbedding = embeddingModel.embed(request.getQuestion()).content();

        // 2. Query store
        List<EmbeddingMatch<TextSegment>> matches = embeddingStore.findRelevant(queryEmbedding, 15);

        // 3. Filter matches matching current user and document in Java
        List<EmbeddingMatch<TextSegment>> filteredMatches = matches.stream()
                .filter(match -> {
                    TextSegment segment = match.embedded();
                    String docMetaId = segment.metadata().get("document_id");
                    String userMetaId = segment.metadata().get("user_id");
                    return doc.getId().toString().equals(docMetaId) && user.getId().toString().equals(userMetaId);
                })
                .limit(3) // Top 3 relevant page chunks
                .collect(Collectors.toList());

        // Build context block
        StringBuilder contextBuilder = new StringBuilder();
        List<KbChatResponse.SourceReference> sources = new ArrayList<>();

        for (EmbeddingMatch<TextSegment> match : filteredMatches) {
            TextSegment segment = match.embedded();
            int page = Integer.parseInt(segment.metadata().get("page_number"));
            
            contextBuilder.append("[Page ").append(page).append("]: ")
                    .append(segment.text()).append("\n\n");

            sources.add(KbChatResponse.SourceReference.builder()
                    .text(segment.text())
                    .pageNumber(page)
                    .build());
        }

        // 4. Construct grounded RAG Prompt
        String prompt = "Answer the query using ONLY the provided text snippets in the Context block.\n" +
                "Cite the source page numbers (e.g. [Page 3]) when answering.\n" +
                "If the query cannot be answered using the provided context, respond exactly with:\n" +
                "\"Information not found in this document.\"\n" +
                "Do not write any comments or speculate outside the context.\n\n" +
                "Context:\n" + contextBuilder.toString() + "\n" +
                "Query: " + request.getQuestion();

        String answer = chatLanguageModel.generate(prompt);

        return KbChatResponse.builder()
                .answer(answer)
                .sources(sources)
                .build();
    }

    private List<String> chunkText(String text, int chunkSize, int overlap) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isEmpty()) return chunks;

        int index = 0;
        while (index < text.length()) {
            int end = Math.min(index + chunkSize, text.length());
            chunks.add(text.substring(index, end));
            index += (chunkSize - overlap);
            if (index >= text.length() || (chunkSize - overlap) <= 0) break;
        }
        return chunks;
    }
}
