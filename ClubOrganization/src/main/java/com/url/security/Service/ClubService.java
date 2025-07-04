package com.url.security.Service;


import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.url.security.dto.ClubCreateDTO;
import com.url.security.dto.ClubDTO;
import com.url.security.model.Club;
import com.url.security.model.ClubMember;
import com.url.security.model.ClubType;
import com.url.security.model.MemberShipRequest;
import com.url.security.model.User;
import com.url.security.repository.ClubMemberRepository;
import com.url.security.repository.ClubRepository;
import com.url.security.repository.MembershipRequestRepository;


@Service
@RequiredArgsConstructor
public class ClubService {
    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final MembershipRequestRepository membershipRequestRepository;

    public ClubCreateDTO createClub(ClubCreateDTO clubDTO, Authentication connectedUser) {
        Club club = Club.builder()
                .name(clubDTO.getName())
                .description(clubDTO.getDescription())
                .type(clubDTO.getType())
                .category(clubDTO.getCategory())
                .build();
        club = clubRepository.save(club);

        User user = ((User) connectedUser.getPrincipal());
        ClubMember adminMember = ClubMember.builder()
                .user(user)
                .club(club)
                .isAdmin(true)
                .isActive(true)
                .build();
        clubMemberRepository.save(adminMember);        
        return clubDTO;
    }
    public List<ClubDTO> getUserClubs(Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        List<ClubMember> clubMembers = clubMemberRepository.findByUser(user);
        return clubMembers.stream()
                .map(clubMember -> {
                    Club club = clubMember.getClub();
                    return ClubDTO.builder()
                            .name(club.getName())
                            .description(club.getDescription())
                            .type(club.getType())
                            .category(club.getCategory())
                            .id(club.getId())
                            .build();
                })
                .toList();
    }
    public List<ClubDTO> getRequestedClubs(Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        List<MemberShipRequest> requestedClubs = membershipRequestRepository.findByUser(user);
        return requestedClubs.stream()
                .map(clubMember -> {
                    Club club = clubMember.getClub();
                    return ClubDTO.builder()
                            .name(club.getName())
                            .description(club.getDescription())
                            .type(club.getType())
                            .category(club.getCategory())
                            .id(club.getId())
                            .build();
                })
                .toList();
   }

   public ClubDTO getClubById(Long id,Authentication user) {
        User connectedUser = ((User) user.getPrincipal());
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + id));
        ClubMember clubMember = clubMemberRepository.findByUserAndClub(connectedUser, club)
                .orElse(null);
        // Get all active members
        List<ClubDTO.MemberInfo> members = club.getMembers() == null ? List.of() :
            club.getMembers().stream()
                .filter(ClubMember::isActive)
                .map(cm -> ClubDTO.MemberInfo.builder()
                    .id(cm.getUser().getId())
                    .fullName(cm.getUser().getFullName())
                    .email(cm.getUser().getUsername())
                    .admin(cm.isAdmin())
                    .build())
                .collect(Collectors.toList());
        return ClubDTO.builder()
                .name(club.getName())
                .description(club.getDescription())
                .type(club.getType())
                .category(club.getCategory())
                .id(club.getId())
                .isAdmin(clubMember != null && clubMember.isAdmin())
                .isPrivate(club.getType() == ClubType.PRIVATE)
                .isMember(clubMember != null)
                .members(members)
                .build();
    }

    public List<ClubDTO> searchClubs(String name, ClubType type, String category) {
        List<Club> clubs = clubRepository.searchClubs(name, type, category);
        return clubs.stream()
                .map(club -> ClubDTO.builder()
                        .name(club.getName())
                        .description(club.getDescription())
                        .type(club.getType())
                        .category(club.getCategory())
                        .id(club.getId())
                        .build())
                .toList();
    }
}
