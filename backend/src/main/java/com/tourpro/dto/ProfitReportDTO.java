package com.tourpro.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfitReportDTO {
    private LocalDate date;
    private BigDecimal revenue;
    private BigDecimal cost;
    private BigDecimal profit;
    private Integer exportCount;
}