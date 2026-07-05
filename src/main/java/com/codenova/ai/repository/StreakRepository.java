package com.codenova.ai.repository;

import com.codenova.ai.model.entity.Streak;
import com.codenova.ai.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StreakRepository extends JpaRepository<Streak, Long> {
    Optional<Streak> findByUser(User user);
}
