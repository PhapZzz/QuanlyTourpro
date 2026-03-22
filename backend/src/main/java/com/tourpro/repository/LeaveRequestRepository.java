package com.tourpro.repository;

import com.tourpro.entity.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeId(Long empId);
    Page<LeaveRequest> findByStatus(LeaveRequest.LeaveStatus status, Pageable pageable);
    long countByStatus(LeaveRequest.LeaveStatus status);
}
