package com.codenova.ai.repository;

import com.codenova.ai.model.entity.SqlMentorHistory;
import com.codenova.ai.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SqlMentorHistoryRepository extends JpaRepository<SqlMentorHistory, Long> {
    List<SqlMentorHistory> findByUserOrderByCreatedAtDesc(User user);
}
