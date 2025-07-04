package com.url.security.dto;

import com.url.security.model.ClubType;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ClubCreateDTO {
    private String name;
    private String description;
    private ClubType type;
    private String category;
}
