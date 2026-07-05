import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { kbService, KbDocument, SourceReference } from '../services/kbService';
import { UploadCloud, MessageSquare, Trash2, Library, Send, Bot, User, HelpCircle } from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const [documents, setDocuments] = useState<KbDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<number | null>(null);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Chat state
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'USER' | 'AI'; text: string; sources?: SourceReference[] }>>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, loadingChat]);

  const fetchDocuments = async () => {
    setLoadingList(true);
    try {
      const data = await kbService.listDocuments();
      setDocuments(data);
      if (data.length > 0 && activeDocId === null) {
        setActiveDocId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load document index:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const newDoc = await kbService.uploadDocument(selectedFile);
      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDocId(newDoc.id);
      setSelectedFile(null);
      setChatLog([]);
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id: number) => {
    if (confirm('Are you sure you want to delete this document and clear its vectors?')) {
      try {
        await kbService.deleteDocument(id);
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (activeDocId === id) {
          setActiveDocId(null);
          setChatLog([]);
        }
      } catch (err) {
        console.error('Failed to delete document:', err);
      }
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || activeDocId === null || loadingChat) return;

    const query = question;
    setQuestion('');
    setLoadingChat(true);

    // Optimistically insert user question
    setChatLog((prev) => [...prev, { sender: 'USER', text: query }]);

    try {
      const reply = await kbService.chatWithPdf(activeDocId, query);
      setChatLog((prev) => [...prev, { sender: 'AI', text: reply.answer, sources: reply.sources }]);
    } catch (err) {
      console.error('RAG query failed:', err);
      setChatLog((prev) => [...prev, { sender: 'AI', text: 'Error querying PDF context. Please try again.' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const activeDocName = documents.find((d) => d.id === activeDocId)?.filename;

  return (
    <div className="grid gap-6 lg:grid-cols-4 h-[calc(100vh-8.5rem)] items-stretch">
      {/* Left panel: Upload drawer & documents list */}
      <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden shrink-0">
        {/* Upload form card */}
        <Card className="p-3 shrink-0">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-primary">
            <UploadCloud className="h-4 w-4" /> Index Slide/Notes
          </h4>
          <form onSubmit={handleUpload} className="space-y-3">
            <div className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-3 text-center cursor-pointer hover:bg-brand-light dark:hover:bg-brand-dark transition-all duration-150 relative">
              <input
                type="file"
                required
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadCloud className="h-6 w-6 text-content-muted-light dark:text-content-muted-dark mx-auto mb-1.5" />
              <p className="text-[10px] text-content-secondary-light dark:text-content-secondary-dark truncate">
                {selectedFile ? selectedFile.name : 'Select PDF (<5MB)'}
              </p>
            </div>
            {selectedFile && (
              <Button type="submit" isLoading={uploading} variant="primary" className="w-full text-[10px] py-1 h-[28px]">
                Process and Vectorize
              </Button>
            )}
          </form>
        </Card>

        {/* Uploaded Documents List */}
        <Card className="flex-1 flex flex-col p-3 overflow-hidden h-full">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-content-primary-light dark:text-content-primary-dark shrink-0">
            Document Index
          </h4>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loadingList ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="animate-pulse h-12 rounded bg-brand-light dark:bg-brand-dark" />
              ))
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <Library className="h-8 w-8 text-content-muted-light dark:text-content-muted-dark mx-auto mb-2" />
                <p className="text-[10px] text-content-secondary-light dark:text-content-secondary-dark">No documents processed.</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`w-full flex items-center justify-between gap-1.5 rounded-lg border p-2.5 transition-all duration-150 ${
                    activeDocId === doc.id
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'border-transparent hover:bg-brand-light dark:hover:bg-brand-dark text-content-secondary-light dark:text-content-secondary-dark'
                  }`}
                >
                  <button
                    onClick={() => {
                      setActiveDocId(doc.id);
                      setChatLog([]);
                    }}
                    className="flex-1 text-left truncate text-xs font-semibold mr-1"
                  >
                    {doc.filename}
                  </button>
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1 rounded text-content-muted-light hover:text-danger dark:text-content-muted-dark transition-colors duration-150"
                    title="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Right panel: RAG chat interface */}
      <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
              PDF Knowledge Chat
            </h2>
            <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark mt-0.5">
              Active Context: <strong className="text-primary">{activeDocName || 'None Selected'}</strong>
            </p>
          </div>
          <Badge variant="ai">RAG Enabled</Badge>
        </div>

        {/* Scrollable messages panel */}
        <Card className="flex-1 overflow-y-auto space-y-4 bg-surface-light dark:bg-surface-dark p-4 border border-border-light dark:border-border-dark mb-3">
          {activeDocId === null ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <Library className="h-10 w-10 text-content-muted-light dark:text-content-muted-dark mx-auto mb-2" />
                <p className="text-sm font-semibold text-content-secondary-light dark:text-content-secondary-dark">
                  Please upload or select a document to start a RAG chat.
                </p>
              </div>
            </div>
          ) : chatLog.length === 0 ? (
            <div className="flex gap-3 max-w-2xl">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ai/10 text-ai border border-ai/20 shadow-glow-ai/10">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="rounded-xl border border-ai/20 bg-ai/5 px-4 py-3 dark:bg-surface-dark dark:border-border-dark">
                <p className="text-sm text-content-primary-light dark:text-content-primary-dark leading-relaxed">
                  I have analyzed <strong>{activeDocName}</strong>. Ask me any question, and I will answer using only details extracted from this PDF, citing source page numbers.
                </p>
              </div>
            </div>
          ) : (
            chatLog.map((chat, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-2xl ${chat.sender === 'USER' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                    chat.sender === 'USER'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-ai/10 text-ai border-ai/20 shadow-glow-ai/10'
                  }`}
                >
                  {chat.sender === 'USER' ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                </div>

                <div
                  className={`rounded-xl px-4 py-3 shadow-sm ${
                    chat.sender === 'USER'
                      ? 'bg-primary text-white'
                      : 'border border-ai/20 bg-ai/5 dark:bg-surface-dark dark:border-border-dark space-y-2'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">{chat.text}</p>
                  
                  {/* Source citation references footer */}
                  {chat.sources && chat.sources.length > 0 && (
                    <div className="pt-2 border-t border-border-light/20 dark:border-border-dark/20 text-[10px] text-content-muted-light dark:text-content-muted-dark">
                      <p className="font-semibold flex items-center gap-1"><HelpCircle className="h-3 w-3" /> Source Pages:</p>
                      <div className="flex gap-1.5 flex-wrap mt-1">
                        {Array.from(new Set(chat.sources.map(s => s.pageNumber))).map((page) => (
                          <span key={page} className="rounded bg-brand-light dark:bg-brand-dark px-1.5 py-0.5 border border-border-light dark:border-border-dark font-mono">
                            Page {page}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loadingChat && (
            <div className="flex gap-3 max-w-2xl">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ai/10 text-ai border border-ai/20 animate-pulse">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="rounded-xl border border-ai/20 bg-ai/5 px-4 py-3 dark:bg-surface-dark dark:border-border-dark flex items-center gap-1">
                <div className="h-1.5 w-1.5 bg-ai rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 bg-ai rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 bg-ai rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </Card>

        {/* Input box */}
        <form onSubmit={handleChat} className="shrink-0">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={activeDocId === null || loadingChat}
                placeholder={
                  activeDocId === null
                    ? 'Select a document first'
                    : 'Ask about this document...'
                }
                className="flex-1 bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-content-primary-light dark:text-content-primary-dark disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={!question.trim() || activeDocId === null || loadingChat}
                variant="primary"
                className="flex items-center gap-1.5 py-2 px-4 text-xs h-[38px]"
              >
                Send <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};
