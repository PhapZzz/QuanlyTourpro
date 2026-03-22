package com.tourpro.dto;

import com.tourpro.entity.User;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

public class UserDTO {

    @Data @Builder
    public static class Response {
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private String role;
        private String status;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CreateRequest {
        @NotBlank private String username;
        @NotBlank @Size(min=6) private String password;
        @NotBlank private String fullName;
        @Email    private String email;
        @NotNull  private User.Role role;
    }

    @Data
    public static class UpdateRequest {
        private String fullName;
        private String email;
        private User.Role role;
        private User.UserStatus status;
    }
}
