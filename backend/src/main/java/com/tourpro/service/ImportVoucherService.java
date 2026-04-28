package com.tourpro.service;

import com.tourpro.dto.CreateImportVoucherRequest;
import com.tourpro.dto.ImportDetailRequest;
import com.tourpro.dto.ImportDetailResponse;
import com.tourpro.dto.ImportVoucherResponse;
import com.tourpro.entity.ImportDetail;
import com.tourpro.entity.ImportVoucher;
import com.tourpro.entity.Product;
import com.tourpro.entity.Supplier;
import com.tourpro.entity.User;
import com.tourpro.repository.ImportVoucherRepository;
import com.tourpro.repository.ProductRepository;
import com.tourpro.repository.SupplierRepository;
import com.tourpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ImportVoucherService {

    private final ImportVoucherRepository importVoucherRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // ================= GET ALL =================

    public List<ImportVoucherResponse> getAll() {

        return importVoucherRepository.findAll()
                .stream()
                .map(this::mapResponse)
                .toList();
    }

    // ================= GET BY ID =================

    public ImportVoucherResponse getById(Long id) {

        ImportVoucher voucher = importVoucherRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy phiếu nhập"));

        return mapResponse(voucher);
    }

    // ================= CREATE =================

    public ImportVoucherResponse create(
            CreateImportVoucherRequest request
    ) {

        Supplier supplier = supplierRepository
                .findById(request.getSupplierId())
                .orElseThrow(() ->
                        new RuntimeException("Nhà cung cấp không tồn tại"));

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User currentUser = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy user"));

        String code = generateCode();

        ImportVoucher voucher = ImportVoucher.builder()
                .code(code)
                .date(request.getDate())
                .supplier(supplier)
                .status(ImportVoucher.VoucherStatus.PENDING)
                .note(request.getNote())
                .createdBy(currentUser)
                .build();

        List<ImportDetail> details = new ArrayList<>();

        BigDecimal total = BigDecimal.ZERO;

        // ================= CREATE DETAILS =================

        for (ImportDetailRequest d : request.getDetails()) {

            Product product = productRepository
                    .findById(d.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException("Sản phẩm không tồn tại"));

            BigDecimal amount = d.getUnitPrice()
                    .multiply(BigDecimal.valueOf(d.getQty()));

            ImportDetail detail = ImportDetail.builder()
                    .voucher(voucher)
                    .product(product)
                    .qty(d.getQty())
                    .unitPrice(d.getUnitPrice())
                    .amount(amount)
                    .build();

            details.add(detail);

            total = total.add(amount);
        }

        voucher.setDetails(details);
        voucher.setTotal(total);

        ImportVoucher saved =
                importVoucherRepository.save(voucher);

        return mapResponse(saved);
    }

    // ================= APPROVE =================

    public ImportVoucherResponse approve(Long id) {

        ImportVoucher voucher = importVoucherRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy phiếu nhập"));

        // Không duyệt lại phiếu đã duyệt
        if (voucher.getStatus() ==
                ImportVoucher.VoucherStatus.APPROVED) {

            throw new RuntimeException(
                    "Phiếu nhập đã được duyệt");
        }

        // Không duyệt phiếu đã từ chối
        if (voucher.getStatus() ==
                ImportVoucher.VoucherStatus.REJECTED) {

            throw new RuntimeException(
                    "Phiếu nhập đã bị từ chối");
        }

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User approver = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy user"));

        // ================= UPDATE STOCK =================

        for (ImportDetail detail : voucher.getDetails()) {

            Product product = detail.getProduct();

            Integer currentQty =
                    product.getStockQty() != null
                            ? product.getStockQty()
                            : 0;

            Integer newQty =
                    currentQty + detail.getQty();

            product.setStockQty(newQty);

            // Auto update trạng thái
            if (newQty > 0) {
                product.setStatus(
                        Product.ProductStatus.ACTIVE
                );
            }

            productRepository.save(product);
        }

        // ================= UPDATE VOUCHER =================

        voucher.setStatus(
                ImportVoucher.VoucherStatus.APPROVED
        );

        voucher.setApprovedBy(approver);

        voucher.setApprovedAt(LocalDateTime.now());

        ImportVoucher saved =
                importVoucherRepository.save(voucher);

        return mapResponse(saved);
    }

    // ================= REJECT =================

    public ImportVoucherResponse reject(Long id) {

        ImportVoucher voucher = importVoucherRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy phiếu nhập"));

        if (voucher.getStatus() ==
                ImportVoucher.VoucherStatus.APPROVED) {

            throw new RuntimeException(
                    "Không thể từ chối phiếu đã duyệt");
        }

        voucher.setStatus(
                ImportVoucher.VoucherStatus.REJECTED
        );

        return mapResponse(
                importVoucherRepository.save(voucher)
        );
    }

    // ================= DELETE =================

    public void delete(Long id) {

        ImportVoucher voucher = importVoucherRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy phiếu nhập"));

        // Không cho xóa phiếu đã duyệt
        if (voucher.getStatus() ==
                ImportVoucher.VoucherStatus.APPROVED) {

            throw new RuntimeException(
                    "Không thể xóa phiếu đã duyệt");
        }

        importVoucherRepository.delete(voucher);
    }

    // ================= GENERATE CODE =================

    private String generateCode() {

        Long maxId = importVoucherRepository.findMaxId();

        long next = (maxId == null ? 1 : maxId + 1);

        return "PN-" + String.format("%05d", next);
    }

    // ================= MAP RESPONSE =================

    private ImportVoucherResponse mapResponse(
            ImportVoucher v
    ) {

        return ImportVoucherResponse.builder()
                .id(v.getId())
                .code(v.getCode())
                .date(v.getDate())

                .supplierId(
                        v.getSupplier() != null
                                ? v.getSupplier().getId()
                                : null
                )

                .supplierName(
                        v.getSupplier() != null
                                ? v.getSupplier().getName()
                                : null
                )

                .total(v.getTotal())

                .status(v.getStatus())

                .note(v.getNote())

                .createdBy(
                        v.getCreatedBy() != null
                                ? v.getCreatedBy().getUsername()
                                : null
                )

                .approvedBy(
                        v.getApprovedBy() != null
                                ? v.getApprovedBy().getUsername()
                                : null
                )

                .approvedAt(v.getApprovedAt())

                .createdAt(v.getCreatedAt())

                .details(
                        v.getDetails()
                                .stream()
                                .map(d ->
                                        ImportDetailResponse.builder()
                                                .id(d.getId())

                                                .productId(
                                                        d.getProduct().getId()
                                                )

                                                .productName(
                                                        d.getProduct().getName()
                                                )

                                                .qty(d.getQty())

                                                .unitPrice(
                                                        d.getUnitPrice()
                                                )

                                                .amount(
                                                        d.getAmount()
                                                )

                                                .build()
                                )
                                .toList()
                )

                .build();
    }
}