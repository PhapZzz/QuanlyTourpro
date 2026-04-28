package com.tourpro.controller;

import com.tourpro.dto.ApiResponse;
import com.tourpro.dto.SalaryDTO;
import com.tourpro.service.SalaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr/salary")
@RequiredArgsConstructor
//@PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER')")
public class SalaryController {

    private final SalaryService salaryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalaryDTO.Response>>> getByMonthYear(
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(ApiResponse.ok(salaryService.getByMonthYear(month, year)));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<ApiResponse<List<SalaryDTO.Response>>> getByEmployee(
            @PathVariable Long empId) {
        return ResponseEntity.ok(ApiResponse.ok(salaryService.getByEmployee(empId)));
    }

    @PostMapping("/{empId}/calculate")
    public ResponseEntity<ApiResponse<SalaryDTO.Response>> calculate(
            @PathVariable Long empId,
            @Valid @RequestBody SalaryDTO.CalculateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(salaryService.calculate(empId, req)));
    }

    /** Tính lương toàn bộ nhân viên ACTIVE trong tháng/năm */
    @PostMapping("/calculate-all")
    public ResponseEntity<ApiResponse<List<SalaryDTO.Response>>> calculateAll(
            @Valid @RequestBody SalaryDTO.CalculateRequest req) {
        List<SalaryDTO.Response> results = salaryService.calculateAll(req);
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã tính lương cho " + results.size() + " nhân viên", results));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approve(@PathVariable Long id) {
        salaryService.approve(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã duyệt bảng lương", null));
    }

    /**
     * Cập nhật thưởng cho một bản ghi lương (chỉ DRAFT mới được sửa).
     * Tự động tính lại deduction và netPay sau khi cập nhật bonus.
     * PATCH /api/hr/salary/{id}/bonus
     */
    @PatchMapping("/{id}/bonus")
    public ResponseEntity<ApiResponse<SalaryDTO.Response>> updateBonus(
            @PathVariable Long id,
            @Valid @RequestBody SalaryDTO.UpdateBonusRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã cập nhật thưởng", salaryService.updateBonus(id, req)));
    }
}