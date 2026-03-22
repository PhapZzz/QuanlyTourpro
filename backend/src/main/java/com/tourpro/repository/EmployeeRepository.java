package com.tourpro.repository;

import com.tourpro.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByCode(String code);
    Page<Employee> findByDepartmentId(Long deptId, Pageable pageable);
    Page<Employee> findByFullNameContainingIgnoreCase(String name, Pageable pageable);
    List<Employee> findByStatus(Employee.EmployeeStatus status);
}
