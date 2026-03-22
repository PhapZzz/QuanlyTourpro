package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.entity.Product;
import com.tourpro.repository.ProductRepository;
import com.tourpro.repository.SupplierRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/warehouse/products")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE_MANAGER')")
public class ProductController {

    private final ProductRepository  productRepo;
    private final SupplierRepository supplierRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO.Response>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        var p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> pg;
        if (search != null && !search.isBlank())
            pg = productRepo.findByNameContainingIgnoreCase(search, p);
        else if (type != null && !type.isBlank())
            pg = productRepo.findByType(Product.ProductType.valueOf(type), p);
        else
            pg = productRepo.findAll(p);

        var content = pg.getContent().stream().map(this::toResponse).toList();
        var result = PageResponse.<ProductDTO.Response>builder()
                .content(content).page(pg.getNumber()).size(pg.getSize())
                .totalElements(pg.getTotalElements()).totalPages(pg.getTotalPages()).build();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(toResponse(
                productRepo.findById(id).orElseThrow(() -> new RuntimeException("Product not found")))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDTO.Response>> create(@Valid @RequestBody ProductDTO.CreateRequest req) {
        var supplier = req.getSupplierId() != null
                ? supplierRepo.findById(req.getSupplierId()).orElse(null) : null;
        String code = "DV" + String.format("%03d", productRepo.count() + 1);
        Product pr = Product.builder()
                .code(code).name(req.getName()).type(req.getType()).supplier(supplier)
                .unit(req.getUnit()).buyPrice(req.getBuyPrice()).sellPrice(req.getSellPrice())
                .stockQty(req.getStockQty() != null ? req.getStockQty() : 0)
                .minStock(req.getMinStock() != null ? req.getMinStock() : 10)
                .status(Product.ProductStatus.ACTIVE).build();
        return ResponseEntity.ok(ApiResponse.ok(toResponse(productRepo.save(pr))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO.Response>> update(
            @PathVariable Long id, @RequestBody ProductDTO.UpdateRequest req) {
        Product pr = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (req.getName()      != null) pr.setName(req.getName());
        if (req.getType()      != null) pr.setType(req.getType());
        if (req.getUnit()      != null) pr.setUnit(req.getUnit());
        if (req.getBuyPrice()  != null) pr.setBuyPrice(req.getBuyPrice());
        if (req.getSellPrice() != null) pr.setSellPrice(req.getSellPrice());
        if (req.getStockQty()  != null) pr.setStockQty(req.getStockQty());
        if (req.getMinStock()  != null) pr.setMinStock(req.getMinStock());
        if (req.getStatus()    != null) pr.setStatus(req.getStatus());
        if (req.getSupplierId() != null)
            pr.setSupplier(supplierRepo.findById(req.getSupplierId()).orElse(null));
        return ResponseEntity.ok(ApiResponse.ok(toResponse(productRepo.save(pr))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Product pr = productRepo.findById(id).orElseThrow();
        pr.setStatus(Product.ProductStatus.INACTIVE);
        productRepo.save(pr);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa sản phẩm", null));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<?>> getLowStock() {
        return ResponseEntity.ok(ApiResponse.ok(
                productRepo.findByStockQtyLessThan(10).stream().map(this::toResponse).toList()));
    }

    private ProductDTO.Response toResponse(Product pr) {
        return ProductDTO.Response.builder()
                .id(pr.getId()).code(pr.getCode()).name(pr.getName())
                .type(pr.getType() != null ? pr.getType().name() : null)
                .supplierName(pr.getSupplier() != null ? pr.getSupplier().getName() : null)
                .unit(pr.getUnit()).buyPrice(pr.getBuyPrice()).sellPrice(pr.getSellPrice())
                .stockQty(pr.getStockQty()).minStock(pr.getMinStock())
                .status(pr.getStatus() != null ? pr.getStatus().name() : null)
                .build();
    }
}
