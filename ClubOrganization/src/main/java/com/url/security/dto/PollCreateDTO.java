package com.url.security.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PollCreateDTO {
    private String question;
    private List<String> options;
    private LocalDateTime closesAt;
    private boolean isAnonymous;
} 