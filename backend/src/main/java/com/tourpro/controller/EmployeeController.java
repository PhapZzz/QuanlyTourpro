package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hr/employees")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER')")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<EmployeeDTO.Response>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long deptId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getAll(search, deptId, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> create(@Valid @RequestBody EmployeeDTO.CreateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> update(
            @PathVariable Long id, @RequestBody EmployeeDTO.UpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.update(id, req)));
    }

    @PostMapping("/{id}/change-position")
    public ResponseEntity<ApiResponse<EmployeeDTO.Response>> changePosition(
            @PathVariable Long id, @Valid @RequestBody EmployeeDTO.ChangePositionRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.changePosition(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã sa thải nhân viên", null));
    }
}
