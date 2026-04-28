package com.tourpro.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "salary_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "base_salary")
    private BigDecimal baseSalary;

    @Column(name = "allowance")
    private BigDecimal allowance;

    @Column(name = "bonus")
    private BigDecimal bonus;

    // ── Từng khoản bảo hiểm ──────────────────────────────
    @Column(name = "social_insurance")
    private BigDecimal socialInsurance;          // BHXH 8%

    @Column(name = "health_insurance")
    private BigDecimal healthInsurance;          // BHYT 1.5%

    @Column(name = "unemployment_insurance")
    private BigDecimal unemploymentInsurance;    // BHTN 1%

    @Column(name = "income_tax")
    private BigDecimal incomeTax;               // Thuế TNCN
    // ─────────────────────────────────────────────────────

    /** Tổng khấu trừ = BHXH + BHYT + BHTN + thuế + extraDeduction */
    @Column(name = "deduction")
    private BigDecimal deduction;

    @Column(name = "net_pay")
    private BigDecimal netPay;

    @Column(name = "working_days")
    private Integer workingDays;

    @Column(name = "actual_days")
    private Integer actualDays;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SalaryStatus status;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum SalaryStatus {
        DRAFT, APPROVED, PAID
    }
}