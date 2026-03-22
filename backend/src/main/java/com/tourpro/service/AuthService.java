package com.tourpro.service;

import com.tourpro.config.JwtUtil;
import com.tourpro.dto.*;
import com.tourpro.entity.User;
import com.tourpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public LoginResponse login(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        User user = userRepo.findByUsername(req.getUsername()).orElseThrow();
        user.setLastLoginAt(LocalDateTime.now());
        userRepo.save(user);

        UserDetails ud = userDetailsService.loadUserByUsername(req.getUsername());
        return LoginResponse.builder()
                .token(jwtUtil.generateToken(ud))
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public void register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already exists: " + req.getUsername());
        if (req.getEmail() != null && userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already in use");

        User user = User.builder()
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .role(req.getRole() != null ? User.Role.valueOf(req.getRole()) : User.Role.CUSTOMER)
                .status(User.UserStatus.ACTIVE)
                .build();
        userRepo.save(user);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest req) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(req.getOldPassword(), user.getPasswordHash()))
            throw new RuntimeException("Old password is incorrect");
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(user);
    }
}
