package com.tourpro.service;

import com.tourpro.dto.EmployeeDTO;
import com.tourpro.dto.PageResponse;
import com.tourpro.entity.*;
import com.tourpro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {

    private final EmployeeRepository       empRepo;
    private final DepartmentRepository     deptRepo;
    private final PositionRepository       posRepo;
    private final PositionHistoryRepository histRepo;

    public PageResponse<EmployeeDTO.Response> getAll(String search, Long deptId, int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Employee> pg;
        if (search != null && !search.isBlank())
            pg = empRepo.findByFullNameContainingIgnoreCase(search, p);
        else if (deptId != null)
            pg = empRepo.findByDepartmentId(deptId, p);
        else
            pg = empRepo.findAll(p);
        return toPageResponse(pg);
    }

    public EmployeeDTO.Response getById(Long id) {
        return toResponse(empRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id)));
    }

    public EmployeeDTO.Response create(EmployeeDTO.CreateRequest req) {
        Department dept = deptRepo.findById(req.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        Position pos = posRepo.findById(req.getPositionId())
                .orElseThrow(() -> new RuntimeException("Position not found"));

        String code = "NV" + String.format("%03d", empRepo.count() + 1);
        Employee emp = Employee.builder()
                .code(code).fullName(req.getFullName()).gender(req.getGender())
                .dob(req.getDob()).cccd(req.getCccd()).phone(req.getPhone()).email(req.getEmail())
                .department(dept).position(pos).hireDate(req.getHireDate())
                .baseSalary(req.getBaseSalary())
                .allowance(req.getAllowance() != null ? req.getAllowance() : java.math.BigDecimal.ZERO)
                .status(Employee.EmployeeStatus.ACTIVE)
                .build();
        Employee saved = empRepo.save(emp);

        histRepo.save(PositionHistory.builder()
                .employee(saved).position(pos)
                .effectiveDate(req.getHireDate())
                .salary(req.getBaseSalary()).note("Initial hire")
                .build());
        return toResponse(saved);
    }

    public EmployeeDTO.Response update(Long id, EmployeeDTO.UpdateRequest req) {
        Employee emp = empRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id));
        if (req.getFullName()    != null) emp.setFullName(req.getFullName());
        if (req.getPhone()       != null) emp.setPhone(req.getPhone());
        if (req.getEmail()       != null) emp.setEmail(req.getEmail());
        if (req.getBaseSalary()  != null) emp.setBaseSalary(req.getBaseSalary());
        if (req.getAllowance()   != null) emp.setAllowance(req.getAllowance());
        if (req.getStatus()      != null) emp.setStatus(req.getStatus());
        if (req.getDepartmentId() != null)
            emp.setDepartment(deptRepo.findById(req.getDepartmentId()).orElseThrow());
        if (req.getPositionId()  != null)
            emp.setPosition(posRepo.findById(req.getPositionId()).orElseThrow());
        return toResponse(empRepo.save(emp));
    }

    public EmployeeDTO.Response changePosition(Long id, EmployeeDTO.ChangePositionRequest req) {
        Employee emp = empRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Position pos = posRepo.findById(req.getPositionId())
                .orElseThrow(() -> new RuntimeException("Position not found"));
        emp.setPosition(pos);
        emp.setBaseSalary(req.getNewSalary());
        histRepo.save(PositionHistory.builder()
                .employee(emp).position(pos)
                .effectiveDate(req.getEffectiveDate())
                .salary(req.getNewSalary()).note(req.getNote())
                .build());
        return toResponse(empRepo.save(emp));
    }

    public void delete(Long id) {
        Employee emp = empRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        emp.setStatus(Employee.EmployeeStatus.TERMINATED);
        empRepo.save(emp);
    }

    private EmployeeDTO.Response toResponse(Employee e) {
        return EmployeeDTO.Response.builder()
                .id(e.getId()).code(e.getCode()).fullName(e.getFullName())
                .gender(e.getGender() != null ? e.getGender().name() : null)
                .dob(e.getDob()).cccd(e.getCccd()).phone(e.getPhone()).email(e.getEmail())
                .departmentName(e.getDepartment() != null ? e.getDepartment().getName() : null)
                .positionTitle(e.getPosition()   != null ? e.getPosition().getTitle()   : null)
                .hireDate(e.getHireDate()).baseSalary(e.getBaseSalary()).allowance(e.getAllowance())
                .status(e.getStatus() != null ? e.getStatus().name() : null)
                .createdAt(e.getCreatedAt())
                .build();
    }

    private PageResponse<EmployeeDTO.Response> toPageResponse(Page<Employee> pg) {
        return PageResponse.<EmployeeDTO.Response>builder()
                .content(pg.getContent().stream().map(this::toResponse).toList())
                .page(pg.getNumber()).size(pg.getSize())
                .totalElements(pg.getTotalElements()).totalPages(pg.getTotalPages())
                .build();
    }
}
