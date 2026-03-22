package com.tourpro.service;

import com.tourpro.dto.SalaryDTO;
import com.tourpro.entity.Employee;
import com.tourpro.entity.SalaryRecord;
import com.tourpro.repository.EmployeeRepository;
import com.tourpro.repository.SalaryRecordRepository;
import com.tourpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SalaryService {

    private final SalaryRecordRepository salaryRepo;
    private final EmployeeRepository     empRepo;
    private final UserRepository         userRepo;

    // BHXH 8% + BHYT 1.5% + BHTN 1% = 10.5%
    private static final BigDecimal INSURANCE_RATE    = new BigDecimal("0.105");
    private static final BigDecimal PERSONAL_DEDUCTION = new BigDecimal("11000000");

    public SalaryDTO.Response calculate(Long empId, SalaryDTO.CalculateRequest req) {
        Employee emp = empRepo.findById(empId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));

        BigDecimal base      = emp.getBaseSalary();
        BigDecimal allowance = emp.getAllowance() != null ? emp.getAllowance() : BigDecimal.ZERO;
        BigDecimal bonus     = req.getBonus() != null ? req.getBonus() : BigDecimal.ZERO;

        // Social insurance deduction
        BigDecimal insurance = base.multiply(INSURANCE_RATE).setScale(0, RoundingMode.HALF_UP);

        // Personal income tax (PIT)
        BigDecimal taxable = base.add(allowance).add(bonus).subtract(insurance).subtract(PERSONAL_DEDUCTION);
        BigDecimal tax = taxable.compareTo(BigDecimal.ZERO) > 0 ? calculatePIT(taxable) : BigDecimal.ZERO;

        BigDecimal extraDeduction = req.getExtraDeduction() != null ? req.getExtraDeduction() : BigDecimal.ZERO;
        BigDecimal totalDeduction = insurance.add(tax).add(extraDeduction);
        BigDecimal netPay = base.add(allowance).add(bonus).subtract(totalDeduction);

        SalaryRecord record = salaryRepo
                .findByEmployeeIdAndMonthAndYear(empId, req.getMonth(), req.getYear())
                .orElse(SalaryRecord.builder()
                        .employee(emp).month(req.getMonth()).year(req.getYear()).build());

        record.setBaseSalary(base);
        record.setAllowance(allowance);
        record.setBonus(bonus);
        record.setDeduction(totalDeduction);
        record.setNetPay(netPay);
        record.setStatus(SalaryRecord.SalaryStatus.DRAFT);

        return toResponse(salaryRepo.save(record));
    }

    public void approve(Long id) {
        SalaryRecord r = salaryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Salary record not found"));
        r.setStatus(SalaryRecord.SalaryStatus.APPROVED);
        r.setApprovedAt(LocalDateTime.now());
        salaryRepo.save(r);
    }

    public List<SalaryDTO.Response> getByMonthYear(int month, int year) {
        return salaryRepo.findByMonthAndYear(month, year).stream().map(this::toResponse).toList();
    }

    public List<SalaryDTO.Response> getByEmployee(Long empId) {
        return salaryRepo.findByEmployeeId(empId).stream().map(this::toResponse).toList();
    }

    // Vietnam PIT 2024 – 7 brackets
    private BigDecimal calculatePIT(BigDecimal taxable) {
        record Bracket(BigDecimal limit, BigDecimal rate) {}
        List<Bracket> brackets = List.of(
                new Bracket(new BigDecimal("5000000"),  new BigDecimal("0.05")),
                new Bracket(new BigDecimal("10000000"), new BigDecimal("0.10")),
                new Bracket(new BigDecimal("18000000"), new BigDecimal("0.15")),
                new Bracket(new BigDecimal("32000000"), new BigDecimal("0.20")),
                new Bracket(new BigDecimal("52000000"), new BigDecimal("0.25")),
                new Bracket(new BigDecimal("80000000"), new BigDecimal("0.30")),
                new Bracket(null,                       new BigDecimal("0.35"))
        );

        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal prev = BigDecimal.ZERO;
        for (Bracket b : brackets) {
            if (b.limit() == null || taxable.compareTo(b.limit()) <= 0) {
                tax = tax.add(taxable.subtract(prev).multiply(b.rate()));
                break;
            }
            tax = tax.add(b.limit().subtract(prev).multiply(b.rate()));
            prev = b.limit();
        }
        return tax.setScale(0, RoundingMode.HALF_UP);
    }

    private SalaryDTO.Response toResponse(SalaryRecord r) {
        return SalaryDTO.Response.builder()
                .id(r.getId())
                .employeeCode(r.getEmployee().getCode())
                .employeeName(r.getEmployee().getFullName())
                .departmentName(r.getEmployee().getDepartment() != null
                        ? r.getEmployee().getDepartment().getName() : null)
                .month(r.getMonth()).year(r.getYear())
                .baseSalary(r.getBaseSalary()).allowance(r.getAllowance())
                .bonus(r.getBonus()).deduction(r.getDeduction()).netPay(r.getNetPay())
                .status(r.getStatus().name())
                .approvedAt(r.getApprovedAt())
                .build();
    }
}
