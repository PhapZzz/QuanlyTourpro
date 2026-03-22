package com.tourpro.service;

import com.tourpro.dto.LeaveDTO;
import com.tourpro.dto.PageResponse;
import com.tourpro.entity.Employee;
import com.tourpro.entity.LeaveRequest;
import com.tourpro.repository.EmployeeRepository;
import com.tourpro.repository.LeaveRequestRepository;
import com.tourpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveService {

    private final LeaveRequestRepository leaveRepo;
    private final EmployeeRepository     empRepo;
    private final UserRepository         userRepo;

    public LeaveDTO.Response submit(Long empId, LeaveDTO.CreateRequest req) {
        Employee emp = empRepo.findById(empId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));

        long days = req.getFromDate().datesUntil(req.getToDate().plusDays(1)).count();

        LeaveRequest leave = LeaveRequest.builder()
                .employee(emp).type(req.getType())
                .fromDate(req.getFromDate()).toDate(req.getToDate())
                .days((int) days).reason(req.getReason())
                .status(LeaveRequest.LeaveStatus.PENDING)
                .build();
        return toResponse(leaveRepo.save(leave));
    }

    public LeaveDTO.Response approve(Long id, Long approvedByUserId, LeaveDTO.ApproveRequest req) {
        LeaveRequest leave = leaveRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leave.setStatus(req.getStatus());
        leave.setApprovedBy(userRepo.findById(approvedByUserId).orElse(null));
        leave.setApprovedAt(LocalDateTime.now());

        if (req.getStatus() == LeaveRequest.LeaveStatus.APPROVED) {
            leave.getEmployee().setStatus(Employee.EmployeeStatus.ON_LEAVE);
            empRepo.save(leave.getEmployee());
        }
        if (req.getStatus() == LeaveRequest.LeaveStatus.REJECTED && req.getComment() != null) {
            leave.setRejectReason(req.getComment());
        }
        return toResponse(leaveRepo.save(leave));
    }

    public PageResponse<LeaveDTO.Response> getPending(int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<LeaveRequest> pg = leaveRepo.findByStatus(LeaveRequest.LeaveStatus.PENDING, p);
        return toPageResponse(pg);
    }

    public PageResponse<LeaveDTO.Response> getAll(int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<LeaveRequest> pg = leaveRepo.findAll(p);
        return toPageResponse(pg);
    }

    public LeaveDTO.Response getById(Long id) {
        return toResponse(leaveRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found")));
    }

    private LeaveDTO.Response toResponse(LeaveRequest l) {
        return LeaveDTO.Response.builder()
                .id(l.getId())
                .employeeName(l.getEmployee().getFullName())
                .employeeCode(l.getEmployee().getCode())
                .type(l.getType().name())
                .fromDate(l.getFromDate()).toDate(l.getToDate())
                .days(l.getDays()).reason(l.getReason())
                .status(l.getStatus().name())
                .approvedBy(l.getApprovedBy() != null ? l.getApprovedBy().getFullName() : null)
                .approvedAt(l.getApprovedAt()).createdAt(l.getCreatedAt())
                .build();
    }

    private PageResponse<LeaveDTO.Response> toPageResponse(Page<LeaveRequest> pg) {
        return PageResponse.<LeaveDTO.Response>builder()
                .content(pg.getContent().stream().map(this::toResponse).toList())
                .page(pg.getNumber()).size(pg.getSize())
                .totalElements(pg.getTotalElements()).totalPages(pg.getTotalPages())
                .build();
    }
}
