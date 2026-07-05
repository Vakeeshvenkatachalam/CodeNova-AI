package com.codenova.ai.repository;

import com.codenova.ai.model.entity.UploadedDocument;
import com.codenova.ai.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UploadedDocumentRepository extends JpaRepository<UploadedDocument, Long> {
    List<UploadedDocument> findByUserOrderByCreatedAtDesc(User user);
}
