package com.tourpro.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ExportVoucherDTO {
    private Long id;
    private String code;
    private LocalDate date;
    private Long bookingId;
    private String bookingCode;
    private String tourName;
    private String customerName;
    private BigDecimal total;
    private String note;
    private String createdByName;
    private LocalDateTime createdAt;
    private List<ExportDetailDTO> details;
}