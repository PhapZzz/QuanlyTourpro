package com.tourpro.repository;

import com.tourpro.entity.SalaryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SalaryRecordRepository extends JpaRepository<SalaryRecord, Long> {
    Optional<SalaryRecord> findByEmployeeIdAndMonthAndYear(Long empId, int month, int year);
    List<SalaryRecord> findByMonthAndYear(int month, int year);
    List<SalaryRecord> findByEmployeeId(Long empId);

    @Query("SELECT SUM(s.netPay) FROM SalaryRecord s WHERE s.month=:m AND s.year=:y AND s.status='PAID'")
    BigDecimal sumNetPayByMonthYear(@Param("m") int month, @Param("y") int year);
}
