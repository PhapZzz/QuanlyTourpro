package com.tourpro.dto;

import com.tourpro.entity.Customer;
import com.tourpro.entity.Employee;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class CustomerDTO {

    @Data @Builder
    public static class Response {
        private Long id;
        private String code;
        private String fullName;
        private String gender;
        private LocalDate dob;
        private String phone;
        private String email;
        private String cccdPassport;
        private String address;
        private String source;
        private String segment;
        private Integer loyaltyPoints;
        private String preferences;
        private String specialRequest;
        private LocalDateTime createdAt;
        private Integer totalBookings;
        private BigDecimal totalSpending;
    }

    @Data
    public static class CreateRequest {
        @NotBlank                     private String fullName;
        private Employee.Gender       gender;
        private LocalDate             dob;
        @NotBlank                     private String phone;
        @Email                        private String email;
        private String                cccdPassport;
        private String                address;
        private Customer.CustomerSource source;
        private Customer.CustomerSegment segment;
        private String                preferences;
        private String                specialRequest;
    }

    @Data
    public static class UpdateRequest {
        private String fullName;
        private Employee.Gender gender;
        private LocalDate dob;
        private String phone;
        private String email;
        private String cccdPassport;
        private String address;
        private Customer.CustomerSource source;
        private Customer.CustomerSegment segment;
        private String preferences;
        private String specialRequest;
    }
}
