package com.tourpro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductStatisticDTO {

    private String productCode;
    private String productName;

    private Integer totalImportQty;
    private Integer totalExportQty;

    private BigDecimal totalImportValue;
    private BigDecimal totalRevenue;
}