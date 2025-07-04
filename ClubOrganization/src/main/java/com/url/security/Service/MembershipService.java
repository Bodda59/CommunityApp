package com.url.security.Service;


import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.url.security.dto.MembershipRequestDTO;
import com.url.security.model.Club;
import com.url.security.model.ClubMember;
import com.url.security.model.ClubType;
import com.url.security.model.MemberShipRequest;
import com.url.security.model.RequestStatus;
import com.url.security.model.User;
import com.url.security.repository.ClubMemberRepository;
import com.url.security.repository.ClubRepository;
import com.url.security.repository.MembershipRequestRepository;
import com.url.security.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MembershipService {
    private final MembershipRequestRepository membershipRequestRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final ClubMemberRepository clubMemberRepository;

    public MembershipRequestDTO requestMembership(Long clubId,Authentication connectedUser) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club not found"));
        User user = (User) connectedUser.getPrincipal();

        if (clubMemberRepository.existsByUserAndClubAndIsActive(user, club, true)) {
            throw new IllegalArgumentException("User is already a member");
        }
        if (membershipRequestRepository.existsByUserAndClubAndStatus(user, club, RequestStatus.PENDING)) {
            throw new IllegalArgumentException("Membership request already pending");
        }
        if(club.getType()==ClubType.PUBLIC){
                ClubMember member = ClubMember.builder()
                        .user(user)
                        .club(club)
                        .isActive(true) // Automatically add to club if public
                        .build();
                clubMemberRepository.save(member);
                MembershipRequestDTO dto = new MembershipRequestDTO();
                dto.setId(null); // No request needed for public clubs
                dto.setUserId(user.getId());
                dto.setClubId(clubId);
                dto.setStatus(RequestStatus.ACCEPTED);
                return dto;
        }

        MemberShipRequest request = MemberShipRequest.builder()
                .user(user)
                .club(club)
                .status(RequestStatus.PENDING)
                .build();
        request = membershipRequestRepository.save(request);

        MembershipRequestDTO dto = new MembershipRequestDTO();
        dto.setId(request.getId());
        dto.setUserId(user.getId());
        dto.setClubId(clubId);
        dto.setStatus(request.getStatus());
        dto.setRequestedAt(request.getRequestedAt());
        return dto;
    }
    
    public MembershipRequestDTO processMembershipRequest(Long requestId, boolean accept) {
        MemberShipRequest request = membershipRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        Club club = request.getClub();


        request.setStatus(accept ? RequestStatus.ACCEPTED : RequestStatus.REJECTED);
        request = membershipRequestRepository.save(request);

        if (accept) {
            ClubMember member = ClubMember.builder()
                    .user(request.getUser())
                    .club(club)
                    .isActive(true) 
                    .build();
            clubMemberRepository.save(member);
            membershipRequestRepository.delete(request); // Remove request after acceptance
        }

        MembershipRequestDTO dto = new MembershipRequestDTO();
        dto.setId(request.getId());
        dto.setUserId(request.getUser().getId());
        dto.setClubId(club.getId());
        dto.setStatus(request.getStatus());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }

    public void makeAdmin(Long userId, Long clubId,Authentication connectedUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club not found"));
        User admin = (User) connectedUser.getPrincipal();

        if (!clubMemberRepository.findByUserAndClub(admin, club)
                .map(ClubMember::isAdmin)
                .orElse(false)) {
            throw new IllegalArgumentException("User is not an admin of this club");
        }

        ClubMember member = clubMemberRepository.findByUserAndClub(user, club)
                .orElseThrow(() -> new IllegalArgumentException("User is not a member of this club"));
        member.setAdmin(true);
        clubMemberRepository.save(member);
    }

    public void kickMember(Long userId, Long clubId, Authentication connectedUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club not found"));
        User admin = (User) connectedUser.getPrincipal();

        if (!clubMemberRepository.findByUserAndClub(admin, club)
                .map(ClubMember::isAdmin)
                .orElse(false)) {
            throw new IllegalArgumentException("User is not an admin of this club");
        }

        ClubMember member = clubMemberRepository.findByUserAndClub(user, club)
                .orElseThrow(() -> new IllegalArgumentException("User is not a member of this club"));
        member.setActive(false);
        clubMemberRepository.save(member);
    }

    public List<MembershipRequestDTO> getUserRequests(Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        int userId = user.getId().intValue();
        return membershipRequestRepository.findByUser(user).stream()
                .map(request -> {
                    MembershipRequestDTO dto = new MembershipRequestDTO();
                    dto.setId(request.getId());
                    dto.setUserId((long) userId);
                    dto.setClubId(request.getClub().getId());
                    dto.setStatus(request.getStatus());
                    dto.setRequestedAt(request.getRequestedAt());
                    dto.setUpdatedAt(request.getUpdatedAt());
                    dto.setFullName(request.getUser().getFullName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<MembershipRequestDTO> getRequestsForClub(Long clubId) {
        Club club = clubRepository.findById(clubId)
            .orElseThrow(() -> new IllegalArgumentException("Club not found"));
        return membershipRequestRepository.findByClubAndStatus(club, RequestStatus.PENDING)
            .stream()
            .map(request -> {
                MembershipRequestDTO dto = new MembershipRequestDTO();
                dto.setId(request.getId());
                dto.setUserId(request.getUser().getId());
                dto.setClubId(clubId);
                dto.setStatus(request.getStatus());
                dto.setRequestedAt(request.getRequestedAt());
                dto.setUpdatedAt(request.getUpdatedAt());
                dto.setFullName(request.getUser().getFullName());
                return dto;
            })
            .collect(java.util.stream.Collectors.toList());
    }
                
}
