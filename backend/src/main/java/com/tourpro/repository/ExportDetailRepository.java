package com.tourpro.repository;

import com.tourpro.entity.ExportDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ExportDetailRepository extends JpaRepository<ExportDetail, Long> {
    
    List<ExportDetail> findByVoucherId(Long voucherId);
    
    @Query("SELECT COALESCE(SUM(ed.amount), 0) FROM ExportDetail ed " +
           "WHERE FUNCTION('DATE', ed.voucher.date) BETWEEN :fromDate AND :toDate")
    java.math.BigDecimal sumAmountByDateBetween(@Param("fromDate") LocalDate fromDate, 
                                                @Param("toDate") LocalDate toDate);
    
    @Query("SELECT COALESCE(SUM(ed.unitPrice * ed.qty), 0) FROM ExportDetail ed " +
           "WHERE FUNCTION('DATE', ed.voucher.date) BETWEEN :fromDate AND :toDate")
    java.math.BigDecimal sumRevenueByDateBetween(@Param("fromDate") LocalDate fromDate, 
                                                  @Param("toDate") LocalDate toDate);
}
