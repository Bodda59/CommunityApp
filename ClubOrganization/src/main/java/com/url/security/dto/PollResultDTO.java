package com.url.security.dto;

import lombok.Data;
import java.util.List;

@Data
public class PollResultDTO {
    private Long pollId;
    private String question;
    private List<PollOptionDTO> options;
    private int totalVotes;
    private boolean isClosed;

    public void setIsClosed(boolean isClosed) {
        this.isClosed = isClosed;
    }
} 