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
import java.time.LocalDate;
import java.time.YearMonth;
@Service
@RequiredArgsConstructor
@Transactional
public class SalaryService {

    private final SalaryRecordRepository salaryRepo;
    private final EmployeeRepository     empRepo;
    private final UserRepository         userRepo;

    private static final BigDecimal SOCIAL_INSURANCE_RATE       = new BigDecimal("0.08");
    private static final BigDecimal HEALTH_INSURANCE_RATE       = new BigDecimal("0.015");
    private static final BigDecimal UNEMPLOYMENT_INSURANCE_RATE = new BigDecimal("0.01");
    private static final BigDecimal PERSONAL_DEDUCTION          = new BigDecimal("11000000");

    // ── Tính lương 1 nhân viên ───────────────────────────
    public SalaryDTO.Response calculate(Long empId, SalaryDTO.CalculateRequest req) {
        Employee emp = empRepo.findById(empId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));
        return calculateAndSave(emp, req);
    }

    // ── Tính lương toàn bộ nhân viên ACTIVE ─────────────
    public List<SalaryDTO.Response> calculateAll(SalaryDTO.CalculateRequest req) {
        List<Employee> activeEmployees = empRepo.findByStatus(Employee.EmployeeStatus.ACTIVE);
        return activeEmployees.stream()
                .map(emp -> calculateAndSave(emp, req))
                .toList();
    }

    // ── Cập nhật thưởng + tính lại netPay ───────────────
    public SalaryDTO.Response updateBonus(Long salaryRecordId, SalaryDTO.UpdateBonusRequest req) {
        SalaryRecord record = salaryRepo.findById(salaryRecordId)
                .orElseThrow(() -> new RuntimeException("Salary record not found: " + salaryRecordId));

        if (record.getStatus() != SalaryRecord.SalaryStatus.DRAFT) {
            throw new IllegalStateException(
                    "Chỉ được cập nhật thưởng cho bản ghi ở trạng thái DRAFT. " +
                            "Trạng thái hiện tại: " + record.getStatus());
        }

        BigDecimal bonus     = req.getBonus() != null ? req.getBonus() : BigDecimal.ZERO;
        BigDecimal base      = record.getBaseSalary();
        BigDecimal allowance = record.getAllowance() != null ? record.getAllowance() : BigDecimal.ZERO;

        // Tính lại bảo hiểm (giữ nguyên từ base)
        BigDecimal socialInsurance       = base.multiply(SOCIAL_INSURANCE_RATE)
                .setScale(0, RoundingMode.HALF_UP);
        BigDecimal healthInsurance       = base.multiply(HEALTH_INSURANCE_RATE)
                .setScale(0, RoundingMode.HALF_UP);
        BigDecimal unemploymentInsurance = base.multiply(UNEMPLOYMENT_INSURANCE_RATE)
                .setScale(0, RoundingMode.HALF_UP);
        BigDecimal totalInsurance        = socialInsurance.add(healthInsurance).add(unemploymentInsurance);

        // Tính lại thuế TNCN với bonus mới
        BigDecimal taxableIncome = base.add(allowance).add(bonus)
                .subtract(totalInsurance)
                .subtract(PERSONAL_DEDUCTION);
        BigDecimal incomeTax = taxableIncome.compareTo(BigDecimal.ZERO) > 0
                ? calculatePIT(taxableIncome) : BigDecimal.ZERO;

        // Giữ nguyên extraDeduction đã lưu trước đó (= deduction - insurance - tax cũ)
        BigDecimal previousExtra = record.getDeduction()
                .subtract(record.getSocialInsurance())
                .subtract(record.getHealthInsurance())
                .subtract(record.getUnemploymentInsurance())
                .subtract(record.getIncomeTax());
        BigDecimal extraDeduction = previousExtra.compareTo(BigDecimal.ZERO) > 0
                ? previousExtra : BigDecimal.ZERO;

        BigDecimal totalDeduction = totalInsurance.add(incomeTax).add(extraDeduction);
        BigDecimal netPay         = base.add(allowance).add(bonus).subtract(totalDeduction);

        record.setBonus(bonus);
        record.setSocialInsurance(socialInsurance);
        record.setHealthInsurance(healthInsurance);
        record.setUnemploymentInsurance(unemploymentInsurance);
        record.setIncomeTax(incomeTax);
        record.setDeduction(totalDeduction);
        record.setNetPay(netPay);

        return toResponse(salaryRepo.save(record));
    }

    private BigDecimal applyProRata(BigDecimal fullSalary, Employee emp, int month, int year) {
        LocalDate hireDate = emp.getHireDate();
        if (hireDate == null) return fullSalary;

        YearMonth salaryMonth = YearMonth.of(year, month);
        LocalDate firstDay    = salaryMonth.atDay(1);
        LocalDate lastDay     = salaryMonth.atEndOfMonth();

        // Nếu hireDate trước hoặc đúng ngày đầu tháng → full lương
        if (!hireDate.isAfter(firstDay)) return fullSalary;

        // Nếu hireDate sau tháng tính lương → lương = 0 (chưa vào)
        if (hireDate.isAfter(lastDay)) return BigDecimal.ZERO;

        // Tính số ngày làm thực tế trong tháng
        int totalDays  = salaryMonth.lengthOfMonth();
        int workedDays = (int) (lastDay.toEpochDay() - hireDate.toEpochDay()) + 1;

        return fullSalary
                .multiply(BigDecimal.valueOf(workedDays))
                .divide(BigDecimal.valueOf(totalDays), 0, RoundingMode.HALF_UP);
    }

    // ── Logic tính lương dùng chung ──────────────────────
    private SalaryDTO.Response calculateAndSave(Employee emp, SalaryDTO.CalculateRequest req) {
//        BigDecimal base      = emp.getBaseSalary();
//        BigDecimal allowance = emp.getAllowance() != null ? emp.getAllowance() : BigDecimal.ZERO;
        BigDecimal base      = applyProRata(emp.getBaseSalary(), emp, req.getMonth(), req.getYear());
        // ← Trước: BigDecimal allowance = emp.getAllowance() != null ? emp.getAllowance() : BigDecimal.ZERO;
        BigDecimal allowance = applyProRata(
                emp.getAllowance() != null ? emp.getAllowance() : BigDecimal.ZERO,
                emp, req.getMonth(), req.getYear());
        BigDecimal bonus     = req.getBonus()          != null ? req.getBonus()          : BigDecimal.ZERO;

        BigDecimal socialInsurance       = base.multiply(SOCIAL_INSURANCE_RATE)
                .setScale(0, RoundingMode.HALF_UP);
        BigDecimal healthInsurance       = base.multiply(HEALTH_INSURANCE_RATE)
                .setScale(0, RoundingMode.HALF_UP);
        BigDecimal unemploymentInsurance = base.multiply(UNEMPLOYMENT_INSURANCE_RATE)
                .setScale(0, RoundingMode.HALF_UP);
        BigDecimal totalInsurance        = socialInsurance.add(healthInsurance).add(unemploymentInsurance);

        BigDecimal taxableIncome = base.add(allowance).add(bonus)
                .subtract(totalInsurance)
                .subtract(PERSONAL_DEDUCTION);
        BigDecimal incomeTax     = taxableIncome.compareTo(BigDecimal.ZERO) > 0
                ? calculatePIT(taxableIncome) : BigDecimal.ZERO;

        BigDecimal extraDeduction = req.getExtraDeduction() != null ? req.getExtraDeduction() : BigDecimal.ZERO;
        BigDecimal totalDeduction = totalInsurance.add(incomeTax).add(extraDeduction);
        BigDecimal netPay         = base.add(allowance).add(bonus).subtract(totalDeduction);

        // Chỉ ghi đè nếu bản ghi đang ở DRAFT (không đụng vào APPROVED/PAID)
        SalaryRecord record = salaryRepo
                .findByEmployeeIdAndMonthAndYear(emp.getId(), req.getMonth(), req.getYear())
                .orElse(SalaryRecord.builder()
                        .employee(emp)
                        .month(req.getMonth())
                        .year(req.getYear())
                        .build());

        if (record.getId() != null && record.getStatus() != SalaryRecord.SalaryStatus.DRAFT) {
            // Bản ghi đã APPROVED/PAID → trả về nguyên, không ghi đè
            return toResponse(record);
        }

        record.setBaseSalary(base);
        record.setAllowance(allowance);
        record.setBonus(bonus);
        record.setSocialInsurance(socialInsurance);
        record.setHealthInsurance(healthInsurance);
        record.setUnemploymentInsurance(unemploymentInsurance);
        record.setIncomeTax(incomeTax);
        record.setDeduction(totalDeduction);
        record.setNetPay(netPay);
        if (req.getWorkingDays() != null) record.setWorkingDays(req.getWorkingDays());
        if (req.getActualDays()  != null) record.setActualDays(req.getActualDays());
        record.setStatus(SalaryRecord.SalaryStatus.DRAFT);

        return toResponse(salaryRepo.save(record));
    }

    public void approve(Long id) {
        SalaryRecord r = salaryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Salary record not found: " + id));
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

    // ── Biểu thuế TNCN 2024 – 7 bậc ─────────────────────
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
        BigDecimal tax  = BigDecimal.ZERO;
        BigDecimal prev = BigDecimal.ZERO;
        for (Bracket b : brackets) {
            if (b.limit() == null || taxable.compareTo(b.limit()) <= 0) {
                tax = tax.add(taxable.subtract(prev).multiply(b.rate()));
                break;
            }
            tax  = tax.add(b.limit().subtract(prev).multiply(b.rate()));
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
                .baseSalary(r.getBaseSalary())
                .allowance(r.getAllowance())
                .bonus(r.getBonus())
                .socialInsurance(r.getSocialInsurance())
                .healthInsurance(r.getHealthInsurance())
                .unemploymentInsurance(r.getUnemploymentInsurance())
                .incomeTax(r.getIncomeTax())
                .deduction(r.getDeduction())
                .netPay(r.getNetPay())
                .workingDays(r.getWorkingDays())
                .actualDays(r.getActualDays())
                .status(r.getStatus().name())
                .approvedBy(r.getApprovedBy())
                .approvedAt(r.getApprovedAt())
                .build();
    }
    public boolean isOwner(Long employeeId, Long principalUserId) {
        return empRepo.findById(employeeId)
                .map(emp -> emp.getUser() != null
                        && emp.getUser().getId().equals(principalUserId))
                .orElse(false);
    }
}