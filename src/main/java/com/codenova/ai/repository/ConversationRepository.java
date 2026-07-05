package com.codenova.ai.repository;

import com.codenova.ai.model.entity.Conversation;
import com.codenova.ai.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    long countByUser(User user);
    List<Conversation> findByUserOrderByUpdatedAtDesc(User user);
}
