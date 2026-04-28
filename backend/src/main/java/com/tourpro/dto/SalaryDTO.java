package com.tourpro.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SalaryDTO {

    @Data
    @Builder
    public static class Response {
        private Long id;
        private String employeeCode;
        private String employeeName;
        private String departmentName;
        private Integer month;
        private Integer year;

        // Thu nhập
        private BigDecimal baseSalary;
        private BigDecimal allowance;
        private BigDecimal bonus;

        // Từng khoản khấu trừ
        private BigDecimal socialInsurance;          // BHXH 8%
        private BigDecimal healthInsurance;          // BHYT 1.5%
        private BigDecimal unemploymentInsurance;    // BHTN 1%
        private BigDecimal incomeTax;               // Thuế TNCN

        // Tổng khấu trừ & thực lĩnh
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
        private Integer workingDays;
        private Integer actualDays;
    }
    @Data
    public static class UpdateBonusRequest {

        @NotNull(message = "Bonus không được để trống")
        @DecimalMin(value = "0", message = "Bonus không được âm")
        private BigDecimal bonus;
    }
}