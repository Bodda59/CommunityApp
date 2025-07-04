package com.url.security.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.url.security.model.Club;
import com.url.security.model.MemberShipRequest;
import com.url.security.model.RequestStatus;
import com.url.security.model.User;

import java.util.List;

public interface MembershipRequestRepository extends JpaRepository<MemberShipRequest, Long> {
    List<MemberShipRequest> findByUser(User user);
    List<MemberShipRequest> findByClubAndStatus(Club club, RequestStatus status);
    List<MemberShipRequest> findByClub(Club club);
    boolean existsByUserAndClubAndStatus(User user, Club club, RequestStatus status);
}
