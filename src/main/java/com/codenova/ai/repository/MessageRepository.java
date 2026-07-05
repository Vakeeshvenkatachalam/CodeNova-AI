package com.codenova.ai.repository;

import com.codenova.ai.model.entity.Conversation;
import com.codenova.ai.model.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation);
    
    // Loaded for context trimming checks
    List<Message> findTop10ByConversationOrderByCreatedAtDesc(Conversation conversation);
}
