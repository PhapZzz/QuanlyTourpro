package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<BookingDTO.Response>>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getAll(status, page, size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','CUSTOMER')")
    public ResponseEntity<ApiResponse<BookingDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getById(id)));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<BookingDTO.Response>>> getByCustomer(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getByCustomer(customerId, page, size)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','CUSTOMER')")
    public ResponseEntity<ApiResponse<BookingDTO.Response>> create(
            @Valid @RequestBody BookingDTO.CreateRequest req,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.create(req, ud.getUsername())));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<BookingDTO.Response>> updateStatus(
            @PathVariable Long id,
            @RequestBody BookingDTO.UpdateStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.updateStatus(id, req)));
    }
}
