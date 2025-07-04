package com.url.security.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.url.security.model.Club;
import com.url.security.model.ClubMember;
import com.url.security.model.User;

import java.util.List;
import java.util.Optional;

public interface ClubMemberRepository extends JpaRepository<ClubMember, Long> {
    List<ClubMember> findByClub(Club club);
    List<ClubMember> findByUser(User user);
    List<ClubMember> findByClubAndIsAdmin(Club club, boolean isAdmin);
    Optional<ClubMember> findByUserAndClub(User user, Club club);
    boolean existsByUserAndClubAndIsActive(User user, Club club, boolean isActive);
}
