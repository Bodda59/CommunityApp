package com.url.security.dto;


import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterUserDto {
    private String password;
    private String fullName;
    private String username;
}
