package com.url.security.repository;



import org.springframework.data.jpa.repository.JpaRepository;

import com.url.security.model.Club;
import com.url.security.model.Post;
import com.url.security.model.PostType;
import com.url.security.model.User;

import java.util.List;

public interface PostRepo extends JpaRepository<Post, Long> {
    List<Post> findByClub(Club club);
    List<Post> findByClubAndType(Club club, PostType type);
    List<Post> findByCreatedBy(User createdBy);
}
