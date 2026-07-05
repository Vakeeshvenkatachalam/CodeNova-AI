package com.codenova.ai.repository;

import com.codenova.ai.model.entity.CodeAnalysis;
import com.codenova.ai.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeAnalysisRepository extends JpaRepository<CodeAnalysis, Long> {
    List<CodeAnalysis> findByUserOrderByCreatedAtDesc(User user);
}
