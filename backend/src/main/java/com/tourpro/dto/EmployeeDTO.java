package com.tourpro.dto;

import com.tourpro.entity.Employee;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmployeeDTO {

    @Data @Builder
    public static class Response {
        private Long id;
        private String code;
        private String fullName;
        private String gender;
        private LocalDate dob;
        private String cccd;
        private String phone;
        private String email;
        private String departmentName;
        private String positionTitle;
        private LocalDate hireDate;
        private BigDecimal baseSalary;
        private BigDecimal allowance;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CreateRequest {
        @NotBlank                   private String fullName;
        private Employee.Gender     gender;
        private LocalDate           dob;
        private String              cccd;
        @NotBlank                   private String phone;
        private String              email;
        @NotNull                    private Long departmentId;
        @NotNull                    private Long positionId;
        @NotNull                    private LocalDate hireDate;
        @NotNull                    private BigDecimal baseSalary;
        private BigDecimal          allowance;
        private Long                userId;
    }

    @Data
    public static class UpdateRequest {
        private String fullName;
        private Employee.Gender gender;
        private LocalDate dob;
        private String phone;
        private String email;
        private Long departmentId;
        private Long positionId;
        private BigDecimal baseSalary;
        private BigDecimal allowance;
        private Employee.EmployeeStatus status;
    }

    @Data
    public static class ChangePositionRequest {
        @NotNull private Long positionId;
        @NotNull private LocalDate effectiveDate;
        @NotNull private BigDecimal newSalary;
        private String note;
    }
}
