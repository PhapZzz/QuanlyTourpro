package com.tourpro.controller;

import com.tourpro.dto.CreateImportVoucherRequest;
//import com.tourpro.dto.CreateImportVoucherRequest;
import com.tourpro.service.ImportVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/warehouse/import-vouchers")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ImportVoucherController {

    private final ImportVoucherService importVoucherService;


    @GetMapping
    public Object getAll() {
        return importVoucherService.getAll();
    }

    @GetMapping("/{id}")
    public Object getById(@PathVariable Long id) {
        return importVoucherService.getById(id);
    }

    @PostMapping
    public Object create(@RequestBody CreateImportVoucherRequest request) {
        return importVoucherService.create(request);
    }

    @PostMapping("/{id}/approve")
    public Object approve(@PathVariable Long id) {
        return importVoucherService.approve(id);
    }

    @PostMapping("/{id}/reject")
    public Object reject(@PathVariable Long id) {
        return importVoucherService.reject(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        importVoucherService.delete(id);
    }
}
