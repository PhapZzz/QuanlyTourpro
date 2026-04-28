package com.tourpro.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ExportDetailDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productCode;
    private Integer qty;
    private BigDecimal unitPrice;
    private BigDecimal amount;
}