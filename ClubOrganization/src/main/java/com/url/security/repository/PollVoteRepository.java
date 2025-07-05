package com.url.security.repository;

import com.url.security.model.PollVote;
import com.url.security.model.PollOption;
import com.url.security.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PollVoteRepository extends JpaRepository<PollVote, Long> {
    Optional<PollVote> findByPollOptionAndUser(PollOption pollOption, User user);
} 