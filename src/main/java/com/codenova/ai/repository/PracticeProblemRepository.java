package com.codenova.ai.repository;

import com.codenova.ai.model.entity.PracticeProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PracticeProblemRepository extends JpaRepository<PracticeProblem, Long> {
    List<PracticeProblem> findByCategoryAndDifficulty(String category, String difficulty);
}
