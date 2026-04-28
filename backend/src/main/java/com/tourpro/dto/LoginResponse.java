package com.tourpro.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private Long id;
    private String token;
    private String username;
    private String fullName;
    private String role;
}
