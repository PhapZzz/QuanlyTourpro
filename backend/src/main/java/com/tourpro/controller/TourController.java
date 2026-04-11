package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    // ─── Tour CRUD ────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TourDTO.Response>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                tourService.getAll(search, type, status, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(tourService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<TourDTO.Response>> create(
            @Valid @RequestBody TourDTO.CreateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(tourService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<TourDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody TourDTO.UpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(tourService.update(id, req)));
    }

    // ─── Quản lý dịch vụ của tour ────────────────────────────

    /**
     * Lấy danh sách dịch vụ của tour
     * GET /api/tours/{id}/services
     */
    @GetMapping("/{id}/services")
    public ResponseEntity<ApiResponse<List<TourDTO.ServiceItem>>> getServices(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(tourService.getServices(id)));
    }

    /**
     * Thêm dịch vụ vào tour
     * POST /api/tours/{id}/services
     * Body: { "productId": 1, "quantity": 2, "note": "2 đêm" }
     */
    @PostMapping("/{id}/services")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','WAREHOUSE_MANAGER')")
    public ResponseEntity<ApiResponse<TourDTO.Response>> addService(
            @PathVariable Long id,
            @Valid @RequestBody TourDTO.AddServiceRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(tourService.addService(id, req)));
    }

    /**
     * Cập nhật số lượng / ghi chú dịch vụ trong tour
     * PUT /api/tours/{tourId}/services/{productId}
     */
    @PutMapping("/{tourId}/services/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','WAREHOUSE_MANAGER')")
    public ResponseEntity<ApiResponse<TourDTO.Response>> updateService(
            @PathVariable Long tourId,
            @PathVariable Long productId,
            @RequestBody TourDTO.UpdateServiceRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                tourService.updateService(tourId, productId, req)));
    }

    /**
     * Xóa dịch vụ khỏi tour
     * DELETE /api/tours/{tourId}/services/{productId}
     */
    @DeleteMapping("/{tourId}/services/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<TourDTO.Response>> removeService(
            @PathVariable Long tourId,
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(
                tourService.removeService(tourId, productId)));
    }

    /**
     * Tính lại giá tour từ tổng chi phí dịch vụ
     * POST /api/tours/{id}/recalculate-price?margin=30
     */
    @PostMapping("/{id}/recalculate-price")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<TourDTO.Response>> recalculatePrice(
            @PathVariable Long id,
            @RequestParam(defaultValue = "30") double margin) {
        return ResponseEntity.ok(ApiResponse.ok(
                tourService.recalculatePrice(id, margin)));
    }

    // ─── Lịch khởi hành ──────────────────────────────────────

    @PostMapping("/{id}/schedules")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<TourDTO.Response>> addSchedule(
            @PathVariable Long id,
            @Valid @RequestBody TourDTO.AddScheduleRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(tourService.addSchedule(id, req)));
    }
}
