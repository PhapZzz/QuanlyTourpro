package com.tourpro.repository;

import com.tourpro.entity.ImportVoucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ImportVoucherRepository extends JpaRepository<ImportVoucher, Long> {
    Page<ImportVoucher> findBySupplierId(Long supplierId, Pageable pageable);
    List<ImportVoucher> findByDateBetween(LocalDate from, LocalDate to);

    @Query("SELECT SUM(v.total) FROM ImportVoucher v WHERE MONTH(v.date)=:m AND YEAR(v.date)=:y AND v.status='APPROVED'")
    BigDecimal sumTotalByMonthYear(@Param("m") int month, @Param("y") int year);
}
