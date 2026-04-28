package com.tourpro.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ImportDetailRequest {
    private Long productId;
    private Integer qty;
    private BigDecimal unitPrice;
}