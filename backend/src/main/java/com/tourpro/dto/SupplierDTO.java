package com.tourpro.dto;

import com.tourpro.entity.Supplier;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

public class SupplierDTO {

    @Data @Builder
    public static class Response {
        private Long id;
        private String code;
        private String name;
        private String type;
        private String taxCode;
        private String phone;
        private String email;
        private String address;
        private String contactPerson;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CreateRequest {
        @NotBlank                    private String name;
        @NotNull                     private Supplier.SupplierType type;
        private String taxCode;
        @NotBlank                    private String phone;
        private String email;
        private String address;
        private String contactPerson;
    }

    @Data
    public static class UpdateRequest {
        private String name;
        private Supplier.SupplierType type;
        private String taxCode;
        private String phone;
        private String email;
        private String address;
        private String contactPerson;
        private Supplier.SupplierStatus status;
    }
}
