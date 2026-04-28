package com.tourpro.controller;

import com.tourpro.dto.ApiResponse;
import com.tourpro.dto.SalaryDTO;
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
public class SalaryController {

    private final SalaryService salaryService;

    // ── ADMIN/HR: xem bảng lương toàn bộ theo tháng/năm ─
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<List<SalaryDTO.Response>>> getByMonthYear(
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(ApiResponse.ok(salaryService.getByMonthYear(month, year)));
    }

    // ── Nhân viên xem lương của chính mình ───────────────
    // Không check role — bất kỳ nhân viên nội bộ nào cũng được
    // xem lương của chính mình (WAREHOUSE, SALES, EMPLOYEE, v.v.)
    @GetMapping("/employee/{empId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') " +
            "or @salaryService.isOwner(#empId, authentication.principal.id)")
    public ResponseEntity<ApiResponse<List<SalaryDTO.Response>>> getByEmployee(
            @PathVariable Long empId) {
        return ResponseEntity.ok(ApiResponse.ok(salaryService.getByEmployee(empId)));
    }

    // ── ADMIN/HR: tính lương 1 nhân viên ─────────────────
    @PostMapping("/{empId}/calculate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<SalaryDTO.Response>> calculate(
            @PathVariable Long empId,
            @Valid @RequestBody SalaryDTO.CalculateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(salaryService.calculate(empId, req)));
    }

    // ── ADMIN/HR: tính lương toàn bộ ACTIVE ──────────────
    @PostMapping("/calculate-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<List<SalaryDTO.Response>>> calculateAll(
            @Valid @RequestBody SalaryDTO.CalculateRequest req) {
        List<SalaryDTO.Response> results = salaryService.calculateAll(req);
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã tính lương cho " + results.size() + " nhân viên", results));
    }

    // ── ADMIN/HR: duyệt lương ────────────────────────────
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> approve(@PathVariable Long id) {
        salaryService.approve(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã duyệt bảng lương", null));
    }

    // ── ADMIN/HR: cập nhật thưởng ────────────────────────
    @PatchMapping("/{id}/bonus")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<SalaryDTO.Response>> updateBonus(
            @PathVariable Long id,
            @Valid @RequestBody SalaryDTO.UpdateBonusRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã cập nhật thưởng", salaryService.updateBonus(id, req)));
    }
}