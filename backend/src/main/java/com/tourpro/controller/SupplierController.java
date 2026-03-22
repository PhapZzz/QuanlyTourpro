package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.entity.Supplier;
import com.tourpro.repository.SupplierRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/warehouse/suppliers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE_MANAGER')")
public class SupplierController {

    private final SupplierRepository supplierRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierDTO.Response>>> getAll(
            @RequestParam(required = false) String search) {
        var all = supplierRepo.findAll().stream()
                .filter(s -> search == null || s.getName().toLowerCase().contains(search.toLowerCase()))
                .map(this::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok(all));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDTO.Response>> getById(@PathVariable Long id) {
        Supplier s = supplierRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        return ResponseEntity.ok(ApiResponse.ok(toResponse(s)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierDTO.Response>> create(@Valid @RequestBody SupplierDTO.CreateRequest req) {
        String code = "NCC" + String.format("%03d", supplierRepo.count() + 1);
        Supplier s = Supplier.builder()
                .code(code).name(req.getName()).type(req.getType())
                .taxCode(req.getTaxCode()).phone(req.getPhone())
                .email(req.getEmail()).address(req.getAddress())
                .contactPerson(req.getContactPerson())
                .status(Supplier.SupplierStatus.ACTIVE)
                .build();
        return ResponseEntity.ok(ApiResponse.ok(toResponse(supplierRepo.save(s))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDTO.Response>> update(
            @PathVariable Long id, @RequestBody SupplierDTO.UpdateRequest req) {
        Supplier s = supplierRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        if (req.getName()          != null) s.setName(req.getName());
        if (req.getType()          != null) s.setType(req.getType());
        if (req.getPhone()         != null) s.setPhone(req.getPhone());
        if (req.getEmail()         != null) s.setEmail(req.getEmail());
        if (req.getAddress()       != null) s.setAddress(req.getAddress());
        if (req.getContactPerson() != null) s.setContactPerson(req.getContactPerson());
        if (req.getStatus()        != null) s.setStatus(req.getStatus());
        return ResponseEntity.ok(ApiResponse.ok(toResponse(supplierRepo.save(s))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Supplier s = supplierRepo.findById(id).orElseThrow();
        s.setStatus(Supplier.SupplierStatus.INACTIVE);
        supplierRepo.save(s);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hóa nhà cung cấp", null));
    }

    private SupplierDTO.Response toResponse(Supplier s) {
        return SupplierDTO.Response.builder()
                .id(s.getId()).code(s.getCode()).name(s.getName())
                .type(s.getType() != null ? s.getType().name() : null)
                .taxCode(s.getTaxCode()).phone(s.getPhone()).email(s.getEmail())
                .address(s.getAddress()).contactPerson(s.getContactPerson())
                .status(s.getStatus() != null ? s.getStatus().name() : null)
                .createdAt(s.getCreatedAt()).build();
    }
}
