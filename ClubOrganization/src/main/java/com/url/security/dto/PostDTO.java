package com.url.security.dto;


import lombok.Data;
import java.time.LocalDateTime;

import com.url.security.model.PostType;

@Data
public class PostDTO {
    private Long id;
    private Long clubId;
    private Long createdById;
    private PostType type;
    private String content;
    private String link;
    private LocalDateTime eventDateTime;
}
