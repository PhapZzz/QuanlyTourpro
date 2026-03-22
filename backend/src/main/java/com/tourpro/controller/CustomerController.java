package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<CustomerDTO.Response>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String segment,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.getAll(search, segment, page, size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<CustomerDTO.Response>> create(@Valid @RequestBody CustomerDTO.CreateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerDTO.Response>> update(
            @PathVariable Long id, @RequestBody CustomerDTO.UpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa", null));
    }
}
