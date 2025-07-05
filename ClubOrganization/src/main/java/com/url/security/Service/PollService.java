package com.url.security.Service;

import com.url.security.dto.*;
import com.url.security.model.*;
import com.url.security.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PollService {
    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PollVoteRepository pollVoteRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
  

    public PollResultDTO createPoll(Long clubId, PollCreateDTO dto, Authentication auth) {
        Club club = clubRepository.findById(clubId).orElseThrow(() -> new IllegalArgumentException("Club not found"));
        String username = auth.getName();
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Poll poll = Poll.builder()
                .club(club)
                .question(dto.getQuestion())
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .closesAt(dto.getClosesAt())
                .isAnonymous(dto.isAnonymous())
                .isClosed(false)
                .build();
        poll = pollRepository.save(poll);
        java.util.List<PollOption> options = new java.util.ArrayList<>();
        for (String opt : dto.getOptions()) {
            PollOption option = PollOption.builder().poll(poll).text(opt).build();
            options.add(pollOptionRepository.save(option));
        }
        poll.setOptions(options);
        poll = pollRepository.save(poll);
        return getPollResult(poll.getId());
    }

    public List<PollResultDTO> getPollsForClub(Long clubId) {
        Club club = clubRepository.findById(clubId).orElseThrow(() -> new IllegalArgumentException("Club not found"));
        return pollRepository.findByClub(club).stream().map(poll -> getPollResult(poll.getId())).collect(Collectors.toList());
    }

    public PollResultDTO getPollResult(Long pollId) {
        Poll poll = pollRepository.findById(pollId).orElseThrow(() -> new IllegalArgumentException("Poll not found"));
        List<PollOptionDTO> optionDTOs = poll.getOptions().stream().map(option -> {
            PollOptionDTO dto = new PollOptionDTO();
            dto.setId(option.getId());
            dto.setText(option.getText());
            dto.setVoteCount(option.getVotes() == null ? 0 : option.getVotes().size());
            // Add voterIds for frontend
            if (option.getVotes() != null) {
                dto.setVoterIds(option.getVotes().stream().map(v -> v.getUser().getId()).collect(java.util.stream.Collectors.toList()));
            } else {
                dto.setVoterIds(java.util.Collections.emptyList());
            }
            return dto;
        }).collect(Collectors.toList());
        int totalVotes = optionDTOs.stream().mapToInt(PollOptionDTO::getVoteCount).sum();
        PollResultDTO result = new PollResultDTO();
        result.setPollId(poll.getId());
        result.setQuestion(poll.getQuestion());
        result.setOptions(optionDTOs);
        result.setTotalVotes(totalVotes);
        result.setIsClosed(poll.isClosed() || (poll.getClosesAt() != null && poll.getClosesAt().isBefore(LocalDateTime.now())));
        return result;
    }

    public void vote(Long pollId, PollVoteDTO voteDTO, Authentication auth) {
        System.out.println("[PollService] vote() called for pollId=" + pollId + ", optionId=" + voteDTO.getOptionId());
        Poll poll = pollRepository.findById(pollId).orElse(null);
        if (poll == null) {
            System.out.println("[PollService] Poll not found");
            throw new IllegalArgumentException("Poll not found");
        }
        if (poll.isClosed() || (poll.getClosesAt() != null && poll.getClosesAt().isBefore(LocalDateTime.now()))) {
            System.out.println("[PollService] Poll is closed");
            throw new IllegalArgumentException("Poll is closed");
        }
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElse(null);
        if (user == null) {
            System.out.println("[PollService] User not found for username: " + username);
            throw new IllegalArgumentException("User not found");
        }
        System.out.println("[PollService] User voting: " + user.getUsername() + " (id=" + user.getId() + ")");
        PollOption option = pollOptionRepository.findById(voteDTO.getOptionId()).orElse(null);
        if (option == null) {
            System.out.println("[PollService] Option not found for id: " + voteDTO.getOptionId());
            throw new IllegalArgumentException("Option not found");
        }
        // Check if user already voted in this poll
        PollVote existingVote = poll.getOptions().stream()
            .flatMap(opt -> opt.getVotes().stream())
            .filter(v -> v.getUser().getId().equals(user.getId()))
            .findFirst().orElse(null);
        if (existingVote != null) {
            System.out.println("[PollService] User already voted, updating vote");
            existingVote.setPollOption(option);
            existingVote.setVotedAt(LocalDateTime.now());
            pollVoteRepository.save(existingVote);
        } else {
            PollVote vote = PollVote.builder().pollOption(option).user(user).votedAt(LocalDateTime.now()).build();
            pollVoteRepository.save(vote);
        }
        // Fetch updated option and poll
        PollOption updatedOption = pollOptionRepository.findById(option.getId()).orElse(null);
        int updatedVotes = updatedOption != null && updatedOption.getVotes() != null ? updatedOption.getVotes().size() : -1;
        System.out.println("[PollService] Option after vote: " + option.getText() + ", votes=" + updatedVotes);
        Poll updatedPoll = pollRepository.findById(pollId).orElse(null);
        int totalVotes = 0;
        if (updatedPoll != null && updatedPoll.getOptions() != null) {
            totalVotes = updatedPoll.getOptions().stream().mapToInt(opt -> opt.getVotes() == null ? 0 : opt.getVotes().size()).sum();
        }
        System.out.println("[PollService] Total votes for poll after voting: " + totalVotes);
        System.out.println("[PollService] Vote saved for user " + user.getUsername() + " on pollId=" + pollId + ", optionId=" + voteDTO.getOptionId());
    }

    public void deletePoll(Long pollId, Authentication auth) {
        Poll poll = pollRepository.findById(pollId)
            .orElseThrow(() -> new IllegalArgumentException("Poll not found"));
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        // Only admins of the club can delete polls
        Club club = poll.getClub();
        boolean isAdmin = club.getMembers() != null && club.getMembers().stream()
            .anyMatch(cm -> cm.getUser().getId().equals(user.getId()) && cm.isAdmin());
        if (!isAdmin) {
            throw new IllegalArgumentException("Only club admins can delete polls");
        }
        pollRepository.delete(poll);
        System.out.println("[PollService] Poll deleted: pollId=" + pollId + " by user=" + user.getUsername());
    }
} 