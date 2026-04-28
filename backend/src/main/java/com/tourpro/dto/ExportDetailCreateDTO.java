package com.tourpro.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ExportDetailCreateDTO {
    private Long productId;
    private Integer qty;
    private BigDecimal unitPrice;
}