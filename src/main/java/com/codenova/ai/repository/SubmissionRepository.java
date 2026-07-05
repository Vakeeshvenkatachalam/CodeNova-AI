package com.codenova.ai.repository;

import com.codenova.ai.model.entity.Submission;
import com.codenova.ai.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    long countByUser(User user);
    long countByUserAndStatus(User user, String status);
    List<Submission> findTop5ByUserOrderByCreatedAtDesc(User user);
    List<Submission> findTop10ByUserOrderByCreatedAtDesc(User user);
    List<Submission> findByUser(User user);
    List<Submission> findByUserAndStatus(User user, String status);
}

