package com.url.security.repository;

import com.url.security.model.Poll;
import com.url.security.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PollRepository extends JpaRepository<Poll, Long> {
    List<Poll> findByClub(Club club);
} 