package com.url.security.dto;

import com.url.security.model.ClubType;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClubDTO {
    private Long id;
    private String name;
    private String description;
    private ClubType type;
    private String category;
    private boolean isAdmin;
    private boolean isPrivate;
    private boolean isMember;
    private List<MemberInfo> members;

    @Data
    @Builder
    public static class MemberInfo {
        private Long id;
        private String fullName;
        private String email;
        private boolean admin;
    }
}
