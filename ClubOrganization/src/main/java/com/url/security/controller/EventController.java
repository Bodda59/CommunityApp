package com.url.security.controller;

import com.url.security.model.Event;
import com.url.security.model.EventRSVP;
import com.url.security.model.EventRSVP.RSVPStatus;
import com.url.security.model.Club;
import com.url.security.model.User;
import com.url.security.repository.EventRepository;
import com.url.security.repository.EventRSVPRepository;
import com.url.security.repository.ClubRepository;
import com.url.security.repository.UserRepository;
import com.url.security.repository.ClubMemberRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private static final Logger logger = LoggerFactory.getLogger(EventController.class);
    private final EventRepository eventRepository;
    private final EventRSVPRepository eventRSVPRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final ClubMemberRepository clubMemberRepository;

    @PostMapping("/club/{clubId}")
    public ResponseEntity<Event> createEvent(@PathVariable Long clubId, @RequestBody Event event, Authentication auth) {
        Club club = clubRepository.findById(clubId).orElseThrow();
        User user = (User) auth.getPrincipal();
        // Only admins can create events
        var memberOpt = clubMemberRepository.findByUserAndClub(user, club);
        if (memberOpt.isEmpty() || !memberOpt.get().isActive() || !memberOpt.get().isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        event.setClub(club);
        event.setCreatedBy(user);
        event.setCreatedAt(LocalDateTime.now());
        Event saved = eventRepository.save(event);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/club/{clubId}")
    public List<Event> getEvents(@PathVariable Long clubId) {
        return eventRepository.findByClubId(clubId);
    }

    @PostMapping("/{eventId}/rsvp")
    public ResponseEntity<EventRSVP> rsvp(@PathVariable Long eventId, @RequestParam RSVPStatus status, Authentication auth) {
        logger.info("RSVP endpoint called: eventId={}, status={}, user={}", eventId, status, ((User)auth.getPrincipal()).getUsername());
        Event event = eventRepository.findById(eventId).orElseThrow();
        User user = (User) auth.getPrincipal();
        Club club = event.getClub();
        // Only active members can RSVP
        var memberOpt = clubMemberRepository.findByUserAndClub(user, club);
        if (memberOpt.isEmpty() || !memberOpt.get().isActive()) {
            logger.warn("RSVP forbidden: user {} is not an active member of club {}", user.getUsername(), club.getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        EventRSVP rsvp = eventRSVPRepository.findByEventIdAndUserId(eventId, user.getId());
        if (rsvp == null) {
            rsvp = EventRSVP.builder()
                .event(event)
                .user(user)
                .status(status)
                .respondedAt(LocalDateTime.now())
                .attended(false)
                .build();
            logger.info("Creating new RSVP for user {} on event {}: {}", user.getUsername(), eventId, status);
        } else {
            rsvp.setStatus(status);
            rsvp.setRespondedAt(LocalDateTime.now());
            logger.info("Updating RSVP for user {} on event {}: {}", user.getUsername(), eventId, status);
        }
        EventRSVP saved = eventRSVPRepository.save(rsvp);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{eventId}/rsvps")
    public List<EventRSVP> getEventRSVPs(@PathVariable Long eventId) {
        return eventRSVPRepository.findByEventId(eventId);
    }

    @PostMapping("/{eventId}/attendance/{userId}")
    public ResponseEntity<EventRSVP> markAttendance(@PathVariable Long eventId, @PathVariable Long userId) {
        EventRSVP rsvp = eventRSVPRepository.findByEventIdAndUserId(eventId, userId);
        if (rsvp != null) {
            rsvp.setAttended(true);
            eventRSVPRepository.save(rsvp);
        }
        return ResponseEntity.ok(rsvp);
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId, Authentication auth) {
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event == null) return ResponseEntity.notFound().build();
        User user = (User) auth.getPrincipal();
        Club club = event.getClub();
        var memberOpt = clubMemberRepository.findByUserAndClub(user, club);
        if (memberOpt.isEmpty() || !memberOpt.get().isActive() || !memberOpt.get().isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        // Delete RSVPs for this event first (to avoid FK constraint issues)
        eventRSVPRepository.findByEventId(eventId).forEach(eventRSVPRepository::delete);
        eventRepository.delete(event);
        return ResponseEntity.ok().build();
    }
} 