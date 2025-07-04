package com.url.security.Service;


import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.url.security.dto.PostDTO;
import com.url.security.model.Club;
import com.url.security.model.ClubMember;
import com.url.security.model.Post;
import com.url.security.model.User;
import com.url.security.repository.ClubMemberRepository;
import com.url.security.repository.ClubRepository;
import com.url.security.repository.PostRepo;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepo postRepository;
    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;

    public PostDTO createPost(PostDTO postDTO, Authentication authentication) {
        Club club = clubRepository.findById(postDTO.getClubId())
                .orElseThrow(() -> new IllegalArgumentException("Club not found"));
        User user = (User) authentication.getPrincipal();
        if (!clubMemberRepository.findByUserAndClub(user, club)
                .map(ClubMember::isAdmin)
                .orElse(false)) {
            throw new IllegalArgumentException("User is not an admin of this club");
        }

        Post post = Post.builder()
                .club(club)
                .createdBy(user)
                .type(postDTO.getType())
                .content(postDTO.getContent())
                .link(postDTO.getLink())
                .eventDateTime(postDTO.getEventDateTime())
                .build();
        post = postRepository.save(post);

        postDTO.setId(post.getId());
        postDTO.setCreatedById(user.getId());
        return postDTO;
    }
    
    public List<PostDTO> getClubPosts(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club not found"));
        return postRepository.findByClub(club).stream()
                .map(post -> {
                    PostDTO dto = new PostDTO();
                    dto.setId(post.getId());
                    dto.setClubId(clubId);
                    dto.setCreatedById(post.getCreatedBy().getId());
                    dto.setType(post.getType());
                    dto.setContent(post.getContent());
                    dto.setLink(post.getLink());
                    dto.setEventDateTime(post.getEventDateTime());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public String deletePost(Long postId, Authentication authentication) {
        System.out.println("Deleting post: " + postId);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        Club club = post.getClub();
        User user = (User) authentication.getPrincipal();
        boolean isAdmin = clubMemberRepository.findByUserAndClub(user, club)
                .map(ClubMember::isAdmin)
                .orElse(false);
        System.out.println("Deleting post: " + post.getId() + " isAdmin: " + isAdmin);
        if (!isAdmin) {
            throw new IllegalArgumentException("User is not an admin of this club");
        }
        System.out.println("Deleting post: " + post.getId());
        postRepository.delete(post);
        return "Post deleted successfully";
    }
    public PostDTO editPost(Long postId, PostDTO postDTO) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        post.setType(postDTO.getType());
        post.setContent(postDTO.getContent());
        post.setLink(postDTO.getLink());
        post.setEventDateTime(postDTO.getEventDateTime());
        
        post = postRepository.save(post);
        
        PostDTO updatedPostDTO = new PostDTO();
        updatedPostDTO.setId(post.getId());
        updatedPostDTO.setClubId(post.getClub().getId());
        updatedPostDTO.setCreatedById(post.getCreatedBy().getId());
        updatedPostDTO.setType(post.getType());
        updatedPostDTO.setContent(post.getContent());
        updatedPostDTO.setLink(post.getLink());
        updatedPostDTO.setEventDateTime(post.getEventDateTime());
        
        return updatedPostDTO;
    }
                
}
