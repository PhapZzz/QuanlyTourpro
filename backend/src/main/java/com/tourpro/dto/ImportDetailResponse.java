package com.tourpro.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ImportDetailResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer qty;
    private BigDecimal unitPrice;
    private BigDecimal amount;
}
