package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TourDTO.Response>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.ok(tourService.getAll(search, type, status, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(tourService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<TourDTO.Response>> create(@Valid @RequestBody TourDTO.CreateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(tourService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<TourDTO.Response>> update(
            @PathVariable Long id, @RequestBody TourDTO.UpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(tourService.update(id, req)));
    }

    @PostMapping("/{id}/schedules")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<TourDTO.Response>> addSchedule(
            @PathVariable Long id, @Valid @RequestBody TourDTO.AddScheduleRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(tourService.addSchedule(id, req)));
    }
}
