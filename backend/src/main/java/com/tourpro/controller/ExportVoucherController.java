package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.service.ExportVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/warehouse/export-vouchers")
@RequiredArgsConstructor
public class ExportVoucherController {

    private final ExportVoucherService exportVoucherService;

    @GetMapping
    public ResponseEntity<List<ExportVoucherDTO>> getAll() {
        return ResponseEntity.ok(exportVoucherService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExportVoucherDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(exportVoucherService.getById(id));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ExportVoucherDTO>> getByDateRange(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to) {
        return ResponseEntity.ok(exportVoucherService.getByDateBetween(from, to));
    }

    @PostMapping
    public ResponseEntity<ExportVoucherDTO> create(
            @RequestBody ExportVoucherCreateDTO createDTO,
            @RequestParam(defaultValue = "1") Long userId) {
        return ResponseEntity.ok(exportVoucherService.create(createDTO, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        exportVoucherService.delete(id);
        return ResponseEntity.ok().build();
    }

    // Profit report endpoints
    @GetMapping("/profit/monthly")
    public ResponseEntity<List<ProfitReportDTO>> getMonthlyProfitReport(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(exportVoucherService.getProfitReportByMonth(year, month));
    }

    @GetMapping("/profit/monthly-summary")
    public ResponseEntity<ProfitReportDTO> getMonthlyProfitSummary(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(exportVoucherService.getMonthlyProfitSummary(year, month));
    }

    @GetMapping("/profit/yearly")
    public ResponseEntity<List<ProfitReportDTO>> getYearlyProfitReport(
            @RequestParam int year) {
        return ResponseEntity.ok(exportVoucherService.getYearlyProfitReport(year));
    }
}