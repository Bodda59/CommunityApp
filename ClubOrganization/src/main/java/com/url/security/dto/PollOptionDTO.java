package com.url.security.dto;

import lombok.Data;
import java.util.List;

@Data
public class PollOptionDTO {
    private Long id;
    private String text;
    private int voteCount;
    private List<Long> voterIds;
} 