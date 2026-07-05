package com.codenova.ai.repository;

import com.codenova.ai.model.entity.DebugSession;
import com.codenova.ai.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DebugSessionRepository extends JpaRepository<DebugSession, Long> {
    List<DebugSession> findByUserOrderByCreatedAtDesc(User user);
}
