package com.tourpro.repository;

import com.tourpro.entity.ExportVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ExportVoucherRepository extends JpaRepository<ExportVoucher, Long> {
    List<ExportVoucher> findByDateBetween(LocalDate from, LocalDate to);
}
