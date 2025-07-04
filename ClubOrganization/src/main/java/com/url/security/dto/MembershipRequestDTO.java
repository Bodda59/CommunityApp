package com.url.security.dto;


import lombok.Data;
import java.time.LocalDateTime;

import com.url.security.model.RequestStatus;

@Data
public class MembershipRequestDTO {
    private Long id;
    private Long userId;
    private Long clubId;
    private RequestStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime updatedAt;
    private String fullName;
    private String email;
}
