package com.tourpro.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ExportVoucherCreateDTO {
    private Long bookingId;
    private String note;
    private List<ExportDetailCreateDTO> details;
}