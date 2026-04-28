package com.tourpro.dto;

import com.tourpro.entity.ImportVoucher;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ImportVoucherResponse {

    private Long id;

    private String code;

    private LocalDate date;

    private Long supplierId;

    private String supplierName;

    private BigDecimal total;

    private ImportVoucher.VoucherStatus status;

    private String note;

    private String createdBy;

    private String approvedBy;

    private LocalDateTime approvedAt;

    private LocalDateTime createdAt;

    private List<ImportDetailResponse> details;
}
