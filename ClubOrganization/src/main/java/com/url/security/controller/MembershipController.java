package com.url.security.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.url.security.Service.MembershipService;
import com.url.security.dto.MembershipRequestDTO;
import com.url.security.dto.MakeAdminRequest;

import java.util.List;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
public class MembershipController {
    private final MembershipService membershipService;

    @PostMapping("/club/{clubId}/join")
    public ResponseEntity<MembershipRequestDTO> requestMembership(
             @PathVariable Long clubId , Authentication user) {
        return ResponseEntity.ok(membershipService.requestMembership(clubId,user));
    }
    
    @PostMapping("/process/{requestId}")
    public ResponseEntity<MembershipRequestDTO> processMembershipRequest(
            @PathVariable Long requestId, @RequestParam boolean accept) {
                System.out.println("Processing membership request with ID: " + requestId + " and accept status: " + accept);
        return ResponseEntity.ok(membershipService.processMembershipRequest(requestId, accept));
    }
    
    @PostMapping("/make-admin")
    public ResponseEntity<Void> makeAdmin(
            @RequestBody MakeAdminRequest request, Authentication user) {
        membershipService.makeAdmin(request.getUserId(), request.getClubId(), user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/kick")
    public ResponseEntity<Void> kickMember(
            @RequestParam Long clubId, @RequestParam Long adminId,Authentication user) {
        membershipService.kickMember(clubId, adminId,user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MembershipRequestDTO>> getUserRequests(Authentication user) {
        return ResponseEntity.ok(membershipService.getUserRequests(user));
    }

    @GetMapping("/club/{clubId}/requests")
    public ResponseEntity<List<MembershipRequestDTO>> getClubRequests(@PathVariable Long clubId) {
        return ResponseEntity.ok(membershipService.getRequestsForClub(clubId));
    }
        
}