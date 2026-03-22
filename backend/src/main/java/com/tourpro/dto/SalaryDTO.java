package com.tourpro.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SalaryDTO {

    @Data @Builder
    public static class Response {
        private Long id;
        private String employeeCode;
        private String employeeName;
        private String departmentName;
        private Integer month;
        private Integer year;
        private BigDecimal baseSalary;
        private BigDecimal allowance;
        private BigDecimal bonus;
        private BigDecimal deduction;
        private BigDecimal netPay;
        private Integer workingDays;
        private Integer actualDays;
        private String status;
        private String approvedBy;
        private LocalDateTime approvedAt;
    }

    @Data
    public static class CalculateRequest {
        @NotNull private Integer month;
        @NotNull private Integer year;
        private BigDecimal bonus;
        private BigDecimal extraDeduction;
    }
}
