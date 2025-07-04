package com.url.security.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.url.security.model.User;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/api")
public class TestController {


   @GetMapping("/a")
    public ResponseEntity<String> getProtectedMessage(@AuthenticationPrincipal User user) {
        System.out.println("🔥 Inside /test/a controller method");
        return ResponseEntity.ok("✅ Hello " + user.getUsername() + ", this is a protected message.");
    }

    @GetMapping("/b")
    public ResponseEntity<String> get() {
        return ResponseEntity.ok("✅ Hello " + ", this is a protected message.");
    }
}
