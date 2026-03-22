package com.tourpro.dto;

import com.tourpro.entity.LeaveRequest;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LeaveDTO {

    @Data @Builder
    public static class Response {
        private Long id;
        private String employeeName;
        private String employeeCode;
        private String type;
        private LocalDate fromDate;
        private LocalDate toDate;
        private Integer days;
        private String reason;
        private String status;
        private String approvedBy;
        private LocalDateTime approvedAt;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CreateRequest {
        @NotNull private LeaveRequest.LeaveType type;
        @NotNull private LocalDate fromDate;
        @NotNull private LocalDate toDate;
        private String reason;
    }

    @Data
    public static class ApproveRequest {
        @NotNull private LeaveRequest.LeaveStatus status;
        private String comment;
    }
}
