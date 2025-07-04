package com.url.security.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.url.security.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findById(Long userId);
}