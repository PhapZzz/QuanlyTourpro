package com.tourpro.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

public class ReviewDTO {

    @Data @Builder
    public static class Response {
        private Long id;
        private String customerName;
        private String tourName;
        private Integer rating;
        private Integer serviceRating;
        private Integer foodRating;
        private Integer guideRating;
        private String comment;
        private String reply;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CreateRequest {
        @NotNull                      private Long bookingId;
        @NotNull                      private Long tourId;
        @NotNull @Min(1) @Max(5)      private Integer rating;
        @Min(1) @Max(5)               private Integer serviceRating;
        @Min(1) @Max(5)               private Integer foodRating;
        @Min(1) @Max(5)               private Integer guideRating;
        @NotBlank                     private String comment;
    }

    @Data
    public static class ReplyRequest {
        @NotBlank private String reply;
    }
}
