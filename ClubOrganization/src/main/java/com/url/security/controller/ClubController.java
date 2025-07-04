package com.url.security.controller;


import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.url.security.Service.ClubService;
import com.url.security.dto.ClubCreateDTO;
import com.url.security.dto.ClubDTO;
import com.url.security.model.ClubType;




@RestController
@RequestMapping("/api/clubs")
public class ClubController {
    private final ClubService clubService ;

    
    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @PostMapping
    public ResponseEntity<ClubCreateDTO> createClub(@RequestBody ClubCreateDTO clubDTO,
                                              Authentication authentication) {
        return ResponseEntity.ok(clubService.createClub(clubDTO, authentication));
    }
    @GetMapping("/userClubs")
    public ResponseEntity<List<ClubDTO>> getUserClubs(Authentication authentication) {
        List<ClubDTO> userClubs = clubService.getUserClubs(authentication);
        return ResponseEntity.ok(userClubs);
    }
    @GetMapping("/getRequestedClubs")
    public ResponseEntity<List<ClubDTO>> getRequestedClubs(Authentication authentication) {
        return ResponseEntity.ok(clubService.getRequestedClubs(authentication));
    }
     
    @GetMapping("/{id}")
    public ResponseEntity<ClubDTO> getClub(@PathVariable Long id, Authentication user) {
        return ResponseEntity.ok(clubService.getClubById(id,user));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClubDTO>> searchClubs(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) ClubType type,
            @RequestParam(required = false) String category) {
        List<ClubDTO> clubs = clubService.searchClubs(name, type, category);
        return ResponseEntity.ok(clubs != null ? clubs : List.of());
    }
    
}
