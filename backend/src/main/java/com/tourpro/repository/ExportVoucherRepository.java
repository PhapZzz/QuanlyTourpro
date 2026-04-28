package com.tourpro.repository;

import com.tourpro.entity.ExportVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExportVoucherRepository extends JpaRepository<ExportVoucher, Long> {
    List<ExportVoucher> findByDateBetween(LocalDate from, LocalDate to);
    
    @Query("SELECT ev FROM ExportVoucher ev LEFT JOIN FETCH ev.details WHERE ev.id = :id")
    Optional<ExportVoucher> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT ev FROM ExportVoucher ev LEFT JOIN FETCH ev.details")
    List<ExportVoucher> findAllWithDetails();
}
