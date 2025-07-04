package com.url.security.repository;

import com.url.security.model.EventRSVP;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRSVPRepository extends JpaRepository<EventRSVP, Long> {
    List<EventRSVP> findByEventId(Long eventId);
    List<EventRSVP> findByUserId(Long userId);
    EventRSVP findByEventIdAndUserId(Long eventId, Long userId);
} 