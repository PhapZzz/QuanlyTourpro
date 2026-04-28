package com.tourpro.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PositionHistoryDTO {
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long positionId;
        private String positionTitle;
        private LocalDate effectiveDate;
        private BigDecimal salary;
        private String note;
        private LocalDateTime createdAt;
    }
}