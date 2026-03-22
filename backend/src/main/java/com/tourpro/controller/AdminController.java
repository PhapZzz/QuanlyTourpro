package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.service.ReportService;
import com.tourpro.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<ReportDTO.DashboardStats>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getDashboardStats()));
    }

    @GetMapping("/reports/revenue")
    public ResponseEntity<ApiResponse<ReportDTO.RevenueReport>> revenueReport(
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getRevenueReport(month, year)));
    }

    @GetMapping("/reports/hr")
    public ResponseEntity<ApiResponse<ReportDTO.HRReport>> hrReport(
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getHRReport(month, year)));
    }

    @GetMapping("/reports/warehouse")
    public ResponseEntity<ApiResponse<ReportDTO.WarehouseReport>> warehouseReport(
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getWarehouseReport(month, year)));
    }
}
