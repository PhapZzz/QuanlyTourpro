package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.service.SalaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hr/salary")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER')")
public class SalaryController {

    private final SalaryService salaryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalaryDTO.Response>>> getByMonthYear(
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(ApiResponse.ok(salaryService.getByMonthYear(month, year)));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<ApiResponse<List<SalaryDTO.Response>>> getByEmployee(@PathVariable Long empId) {
        return ResponseEntity.ok(ApiResponse.ok(salaryService.getByEmployee(empId)));
    }

    @PostMapping("/{empId}/calculate")
    public ResponseEntity<ApiResponse<SalaryDTO.Response>> calculate(
            @PathVariable Long empId, @Valid @RequestBody SalaryDTO.CalculateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(salaryService.calculate(empId, req)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approve(@PathVariable Long id) {
        salaryService.approve(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã duyệt bảng lương", null));
    }
}
