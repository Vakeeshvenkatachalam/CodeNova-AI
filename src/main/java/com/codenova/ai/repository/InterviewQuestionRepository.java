package com.codenova.ai.repository;

import com.codenova.ai.model.entity.InterviewQuestion;
import com.codenova.ai.model.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findByInterviewSessionOrderByCreatedAtAsc(InterviewSession session);
}
