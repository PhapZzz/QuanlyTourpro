package com.tourpro.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateImportVoucherRequest {
    private LocalDate date;
    private Long supplierId;
    private String note;
    private List<ImportDetailRequest> details;
}