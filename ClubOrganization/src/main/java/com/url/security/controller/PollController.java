package com.url.security.controller;

import com.url.security.Service.PollService;
import com.url.security.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/polls")
@RequiredArgsConstructor
public class PollController {
    private final PollService pollService;

    @PostMapping("/club/{clubId}")
    public ResponseEntity<PollResultDTO> createPoll(@PathVariable Long clubId, @RequestBody PollCreateDTO dto, Authentication auth) {
        return ResponseEntity.ok(pollService.createPoll(clubId, dto, auth));
    }

    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<PollResultDTO>> getPollsForClub(@PathVariable Long clubId) {
        return ResponseEntity.ok(pollService.getPollsForClub(clubId));
    }

    @GetMapping("/{pollId}")
    public ResponseEntity<PollResultDTO> getPoll(@PathVariable Long pollId) {
        return ResponseEntity.ok(pollService.getPollResult(pollId));
    }

    @PostMapping("/{pollId}/vote")
    public ResponseEntity<Void> vote(@PathVariable Long pollId, @RequestBody PollVoteDTO voteDTO, Authentication auth) {
        System.out.println("[PollController] vote endpoint hit for pollId=" + pollId + ", optionId=" + voteDTO.getOptionId());
        pollService.vote(pollId, voteDTO, auth);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{pollId}")
    public ResponseEntity<Void> deletePoll(@PathVariable Long pollId, Authentication auth) {
        pollService.deletePoll(pollId, auth);
        return ResponseEntity.ok().build();
    }
} 