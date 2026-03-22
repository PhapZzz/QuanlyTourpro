package com.tourpro.dto;

import com.tourpro.entity.Product;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

public class ProductDTO {

    @Data @Builder
    public static class Response {
        private Long id;
        private String code;
        private String name;
        private String type;
        private String supplierName;
        private String unit;
        private BigDecimal buyPrice;
        private BigDecimal sellPrice;
        private Integer stockQty;
        private Integer minStock;
        private String status;
    }

    @Data
    public static class CreateRequest {
        @NotBlank                  private String name;
        @NotNull                   private Product.ProductType type;
        private Long               supplierId;
        private String             unit;
        @NotNull                   private BigDecimal buyPrice;
        @NotNull                   private BigDecimal sellPrice;
        @Min(0)                    private Integer stockQty;
        private Integer            minStock;
    }

    @Data
    public static class UpdateRequest {
        private String name;
        private Product.ProductType type;
        private Long supplierId;
        private String unit;
        private BigDecimal buyPrice;
        private BigDecimal sellPrice;
        private Integer stockQty;
        private Integer minStock;
        private Product.ProductStatus status;
    }
}
