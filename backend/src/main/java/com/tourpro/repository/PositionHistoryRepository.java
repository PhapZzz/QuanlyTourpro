package com.tourpro.repository;

import com.tourpro.entity.PositionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PositionHistoryRepository extends JpaRepository<PositionHistory, Long> {
    List<PositionHistory> findByEmployeeIdOrderByEffectiveDateDesc(Long employeeId);
}
