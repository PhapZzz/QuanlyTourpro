package com.tourpro.dto;

import com.tourpro.entity.Tour;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class TourDTO {

    @Data @Builder
    public static class Response {
        private Long id;
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
        private List<ScheduleResponse> schedules;
    }

    @Data @Builder
    public static class ScheduleResponse {
        private Long id;
        private LocalDate departureDate;
        private Integer capacity;
        private Integer booked;
        private Integer available;
        private String status;
    }

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
    }

    @Data
    public static class UpdateRequest {
        private String name;
        private Tour.TourType type;
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
        private Tour.TourStatus status;
    }

    @Data
    public static class AddScheduleRequest {
        @NotNull private LocalDate departureDate;
        @Min(1)  private Integer capacity;
        private Long guideId;
    }
}
