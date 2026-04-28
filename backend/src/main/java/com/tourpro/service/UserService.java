package com.tourpro.service;

import com.tourpro.dto.PageResponse;
import com.tourpro.dto.UserDTO;
import com.tourpro.entity.User;
import com.tourpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tourpro.entity.Customer;
import com.tourpro.entity.Employee;
import com.tourpro.repository.CustomerRepository;
import com.tourpro.repository.EmployeeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final CustomerRepository customerRepo;
    private final EmployeeRepository employeeRepo;
    public PageResponse<UserDTO.Response> getAll(int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> pg = userRepo.findAll(p);
        return toPageResponse(pg);
    }

    public UserDTO.Response create(UserDTO.CreateRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already exists");

        User saved = userRepo.save(User.builder()
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .role(req.getRole())
                .status(User.UserStatus.ACTIVE)
                .build());

        switch (req.getRole()) {
            case CUSTOMER -> customerRepo.save(Customer.builder()
                    .user(saved)
                    .code(generateCustomerCode())   // "KH" + timestamp
                    .fullName(saved.getFullName())
                    .email(saved.getEmail())
                    .phone("00")                       // cập nhật sau
                    .segment(Customer.CustomerSegment.NEW)
                    .loyaltyPoints(0)
                    .build());

            case EMPLOYEE, HR_MANAGER, WAREHOUSE_MANAGER, SALES_MANAGER -> employeeRepo.save(Employee.builder()
                    .user(saved)
                    .fullName(saved.getFullName())
                    .code(generateEmployeeCode())
                    .email(saved.getEmail())
                    .baseSalary(BigDecimal.ZERO)     // cập nhật sau
                    .allowance(BigDecimal.ZERO)
                    .status(Employee.EmployeeStatus.ACTIVE)
                    .hireDate(LocalDate.now())
                    .build());
        }

        return toResponse(saved);
    }

    // Sinh code dạng KH20250428001
    private String generateCustomerCode() {
        String prefix = "KH" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = customerRepo.count();
        return prefix + String.format("%03d", count + 1);
    }
    private String generateEmployeeCode() {
        String prefix = "NV" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = employeeRepo.count();
        return prefix + String.format("%03d", count + 1);
    }

    public UserDTO.Response update(Long id, UserDTO.UpdateRequest req) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        if (req.getFullName() != null) u.setFullName(req.getFullName());
        if (req.getEmail()    != null) u.setEmail(req.getEmail());
        if (req.getRole()     != null) u.setRole(req.getRole());
        if (req.getStatus()   != null) u.setStatus(req.getStatus());
        return toResponse(userRepo.save(u));
    }

    public void delete(Long id) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        u.setStatus(User.UserStatus.INACTIVE);
        userRepo.save(u);
    }

    public UserDTO.Response getById(Long id) {
        return toResponse(userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    private UserDTO.Response toResponse(User u) {
        return UserDTO.Response.builder()
                .id(u.getId()).username(u.getUsername()).fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole() != null ? u.getRole().name() : null)
                .status(u.getStatus() != null ? u.getStatus().name() : null)
                .lastLoginAt(u.getLastLoginAt()).createdAt(u.getCreatedAt())
                .build();
    }

    private PageResponse<UserDTO.Response> toPageResponse(Page<User> pg) {
        return PageResponse.<UserDTO.Response>builder()
                .content(pg.getContent().stream().map(this::toResponse).toList())
                .page(pg.getNumber()).size(pg.getSize())
                .totalElements(pg.getTotalElements()).totalPages(pg.getTotalPages())
                .build();
    }
}
