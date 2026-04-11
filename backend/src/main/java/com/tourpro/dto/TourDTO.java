package com.tourpro.dto;

import com.tourpro.entity.Tour;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class TourDTO {

    // ─── Response ───────────────────────────────────────────
    @Data @Builder
    public static class Response {
        private Long   id;
        private String code;
        private String name;
        private String type;
        private String origin;
        private String destination;
        private Integer days;
        private Integer nights;
        private Integer capacity;
        private BigDecimal priceAdult;
        private BigDecimal priceChild;
        private String description;
        private String itinerary;
        private String included;
        private String notIncluded;
        private String status;
        private Double avgRating;
        private Integer totalBookings;
        private BigDecimal estimatedCost;   // tổng chi phí dịch vụ

        // Danh sách dịch vụ cấu thành tour
        private List<ServiceItem> services;
        private List<ScheduleResponse> schedules;
    }

    /** Một dịch vụ trong tour */
    @Data @Builder
    public static class ServiceItem {
        private Long   tourServiceId;  // id bản ghi TourService
        private Long   productId;
        private String productCode;
        private String productName;
        private String productType;
        private String supplierName;
        private Integer quantity;
        private String note;
        private Integer sortOrder;
        private BigDecimal buyPrice;
        private BigDecimal sellPrice;
        private BigDecimal subtotalCost;   // buyPrice × quantity
    }

    @Data @Builder
    public static class ScheduleResponse {
        private Long      id;
        private LocalDate departureDate;
        private Integer   capacity;
        private Integer   booked;
        private Integer   available;
        private String    status;
    }

    // ─── Create Tour ─────────────────────────────────────────
    @Data
    public static class CreateRequest {
        @NotBlank                  private String name;
        @NotNull                   private Tour.TourType type;
        private String             origin;
        @NotBlank                  private String destination;
        @Min(1)                    private Integer days;
        private Integer            nights;
        @Min(1)                    private Integer capacity;
        @NotNull                   private BigDecimal priceAdult;
        private BigDecimal         priceChild;
        private String             description;
        private String             itinerary;
        private String             included;
        private String             notIncluded;

        // Dịch vụ ban đầu (có thể thêm sau)
        private List<AddServiceRequest> services;
    }

    // ─── Update Tour ─────────────────────────────────────────
    @Data
    public static class UpdateRequest {
        private String         name;
        private Tour.TourType  type;
        private String         origin;
        private String         destination;
        private Integer        days;
        private Integer        nights;
        private Integer        capacity;
        private BigDecimal     priceAdult;
        private BigDecimal     priceChild;
        private String         description;
        private String         itinerary;
        private String         included;
        private String         notIncluded;
        private Tour.TourStatus status;
    }

    // ─── Thêm dịch vụ vào tour ───────────────────────────────
    @Data
    public static class AddServiceRequest {
        @NotNull               private Long    productId;
        @Min(1)                private Integer quantity;
        private String         note;
        private Integer        sortOrder;
    }

    // ─── Sửa dịch vụ trong tour ──────────────────────────────
    @Data
    public static class UpdateServiceRequest {
        @Min(1)    private Integer quantity;
        private String     note;
        private Integer    sortOrder;
    }

    // ─── Thêm lịch khởi hành ─────────────────────────────────
    @Data
    public static class AddScheduleRequest {
        @NotNull private LocalDate departureDate;
        @Min(1)  private Integer   capacity;
        private Long guideId;
    }
}
