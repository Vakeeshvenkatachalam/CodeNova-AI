package com.codenova.ai.repository;

import com.codenova.ai.model.entity.UserProgress;
import com.codenova.ai.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    Optional<UserProgress> findByUser(User user);
}
