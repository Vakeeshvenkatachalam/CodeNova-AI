package com.codenova.ai.repository;

import com.codenova.ai.model.entity.InterviewSession;
import com.codenova.ai.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    long countByUserAndStatus(User user, String status);
}
