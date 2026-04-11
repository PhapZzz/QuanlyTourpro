package com.tourpro.dto;

import com.tourpro.entity.Booking;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingDTO {

    @Data @Builder
    public static class Response {
        private Long id;
        private String code;
        private String customerName;
        private String customerPhone;
        private String tourName;
        private String destination;
        private LocalDate departureDate;
        private Integer adults;
        private Integer children;
        private BigDecimal totalPrice;
        private BigDecimal deposit;
        private BigDecimal discount;
        private String paymentMethod;
        private String paymentStatus;
        private String status;
        private String note;
        private String createdBy;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CreateRequest {

        private Long customerId; // không requie

        @NotNull(message = "tourScheduleId không được null")
        private Long tourScheduleId;

        @NotNull
        private Integer adults;

        private Integer children;

        private String paymentMethod;
        private String note;
    }

    @Data
    public static class UpdateStatusRequest {
        @NotNull private Booking.BookingStatus status;
        private String note;
        private String cancelReason;
    }
}
