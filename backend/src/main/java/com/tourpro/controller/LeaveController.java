package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hr/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<LeaveDTO.Response>>> getAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getAll(page, size)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<LeaveDTO.Response>>> getPending(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getPending(page, size)));
    }

    @PostMapping("/employee/{empId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER','EMPLOYEE')")
    public ResponseEntity<ApiResponse<LeaveDTO.Response>> submit(
            @PathVariable Long empId,
            @Valid @RequestBody LeaveDTO.CreateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.submit(empId, req)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<LeaveDTO.Response>> approve(
            @PathVariable Long id,
            @RequestBody LeaveDTO.ApproveRequest req,
            @AuthenticationPrincipal UserDetails ud) {
        // Passing 1L as placeholder — in production, look up user id from ud.getUsername()
        return ResponseEntity.ok(ApiResponse.ok(leaveService.approve(id, 1L, req)));
    }
}
