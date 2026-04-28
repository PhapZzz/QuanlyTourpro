package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    // ── ADMIN/HR: xem toàn bộ danh sách ─────────────────
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<EmployeeDTO.Response>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long deptId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getAll(search, deptId, page, size)));
    }

    // ── ADMIN/HR: xem chi tiết bất kỳ nhân viên ─────────
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getById(id)));
    }

    // ── Tất cả nhân viên nội bộ xem hồ sơ của chính mình
    // Không check role — chỉ cần userId khớp.
    // ADMIN/HR được xem của bất kỳ ai.
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') " +
            "or #userId == authentication.principal.id")
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> getByUserId(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getByUserId(userId)));
    }

    // ── ADMIN/HR tạo mới ─────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> create(
            @Valid @RequestBody EmployeeDTO.CreateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.create(req)));
    }

    // ── ADMIN/HR cập nhật, hoặc chính nhân viên đó sửa hồ sơ cá nhân
    // Service phân biệt: EMPLOYEE chỉ sửa được các field cá nhân
    // (phone, address, personalEmail, cccd)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') " +
            "or @employeeService.isOwner(#id, authentication.principal.id)")
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody EmployeeDTO.UpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.update(id, req)));
    }

    // ── ADMIN/HR only: đổi chức vụ ──────────────────────
    @PostMapping("/{id}/change-position")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> changePosition(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeDTO.ChangePositionRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.changePosition(id, req)));
    }

    // ── ADMIN only: sa thải ──────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã sa thải nhân viên", null));
    }

    // ── Nhân viên xem lịch sử chức vụ của chính mình ────
    @GetMapping("/{id}/position-history")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') " +
            "or @employeeService.isOwner(#id, authentication.principal.id)")
    public ResponseEntity<?> getPositionHistory(@PathVariable Long id) {
        List<PositionHistoryDTO.Response> history = employeeService.getPositionHistory(id);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }
}