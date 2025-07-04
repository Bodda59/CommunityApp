package com.url.security.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.url.security.Service.PostService;
import com.url.security.dto.PostDTO;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostDTO> createPost(@RequestBody PostDTO postDTO,Authentication user) {
        return ResponseEntity.ok(postService.createPost(postDTO, user));
    }
    
    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<PostDTO>> getClubPosts(@PathVariable Long clubId) {
        return ResponseEntity.ok(postService.getClubPosts(clubId));
    }

    @DeleteMapping("/delete/{postId}")
    public ResponseEntity<String> deletePost(@PathVariable Long postId, Authentication user) {
        System.out.println("Deleting post Controller: " + postId);
        String result = postService.deletePost(postId, user);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/edit/{postId}")
    public ResponseEntity<PostDTO> editPost(@PathVariable Long postId, @RequestBody PostDTO postDTO) {
        return ResponseEntity.ok(postService.editPost(postId, postDTO));
    }
    
}
