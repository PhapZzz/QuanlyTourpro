package com.tourpro.service;

import com.tourpro.dto.ReportDTO;
import com.tourpro.entity.*;
import com.tourpro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final BookingRepository      bookingRepo;
    private final SalaryRecordRepository salaryRepo;
    private final EmployeeRepository     empRepo;
    private final LeaveRequestRepository leaveRepo;
    private final ProductRepository      productRepo;
    private final ImportVoucherRepository importRepo;
    private final TourRepository         tourRepo;
    private final CustomerRepository     customerRepo;

    public ReportDTO.DashboardStats getDashboardStats() {
        LocalDate now = LocalDate.now();
        return ReportDTO.DashboardStats.builder()
                .totalTours(tourRepo.count())
                .totalBookingsThisMonth(bookingRepo.countByMonthYear(now.getMonthValue(), now.getYear()))
                .revenueThisMonth(Optional.ofNullable(
                        bookingRepo.sumRevenueByMonthYear(now.getMonthValue(), now.getYear()))
                        .orElse(BigDecimal.ZERO))
                .totalEmployees(empRepo.count())
                .totalCustomers(customerRepo.count())
                .pendingLeaveRequests(leaveRepo.countByStatus(LeaveRequest.LeaveStatus.PENDING))
                .pendingBookings(bookingRepo.findByStatus(
                        Booking.BookingStatus.PENDING, PageRequest.of(0,1)).getTotalElements())
                .build();
    }

    public ReportDTO.RevenueReport getRevenueReport(int month, int year) {
        BigDecimal revenue = Optional.ofNullable(
                bookingRepo.sumRevenueByMonthYear(month, year)).orElse(BigDecimal.ZERO);
        BigDecimal importCost = Optional.ofNullable(
                importRepo.sumTotalByMonthYear(month, year)).orElse(BigDecimal.ZERO);
        BigDecimal salaryCost = Optional.ofNullable(
                salaryRepo.sumNetPayByMonthYear(month, year)).orElse(BigDecimal.ZERO);
        BigDecimal totalCost  = importCost.add(salaryCost);
        BigDecimal profit     = revenue.subtract(totalCost);
        double margin = revenue.compareTo(BigDecimal.ZERO) > 0
                ? profit.divide(revenue, 4, java.math.RoundingMode.HALF_UP).doubleValue() * 100 : 0;

        List<Object[]> topTours = bookingRepo.topToursByBooking(month, year, PageRequest.of(0, 5));
        List<ReportDTO.TourRevenueItem> byTour = topTours.stream().map(row ->
                ReportDTO.TourRevenueItem.builder()
                        .tourName((String) row[0])
                        .bookings((Long) row[1])
                        .revenue(BigDecimal.ZERO).cost(BigDecimal.ZERO).profit(BigDecimal.ZERO)
                        .build()).toList();

        return ReportDTO.RevenueReport.builder()
                .month(month).year(year)
                .totalRevenue(revenue).totalCost(totalCost)
                .grossProfit(profit)
                .profitMargin(Math.round(margin * 100.0) / 100.0)
                .totalBookings(bookingRepo.countByMonthYear(month, year))
                .totalCustomers(customerRepo.count())
                .byTour(byTour).build();
    }

    public ReportDTO.HRReport getHRReport(int month, int year) {
        return ReportDTO.HRReport.builder()
                .month(month).year(year)
                .totalEmployees(empRepo.count())
                .activeEmployees((long) empRepo.findByStatus(Employee.EmployeeStatus.ACTIVE).size())
                .totalSalary(Optional.ofNullable(
                        salaryRepo.sumNetPayByMonthYear(month, year)).orElse(BigDecimal.ZERO))
                .totalBonus(BigDecimal.ZERO)
                .pendingLeaves(leaveRepo.countByStatus(LeaveRequest.LeaveStatus.PENDING))
                .approvedLeaves(leaveRepo.countByStatus(LeaveRequest.LeaveStatus.APPROVED))
                .build();
    }

    public ReportDTO.WarehouseReport getWarehouseReport(int month, int year) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to   = from.plusMonths(1).minusDays(1);
        List<Product> lowStock = productRepo.findByStockQtyLessThan(10);

        return ReportDTO.WarehouseReport.builder()
                .month(month).year(year)
                .totalProducts((int) productRepo.count())
                .inventoryValue(Optional.ofNullable(
                        productRepo.totalInventoryValue()).orElse(BigDecimal.ZERO))
                .totalImportValue(Optional.ofNullable(
                        importRepo.sumTotalByMonthYear(month, year)).orElse(BigDecimal.ZERO))
                .importVouchers(importRepo.findByDateBetween(from, to).size())
                .lowStockItems(lowStock.stream().map(p -> ReportDTO.LowStockItem.builder()
                        .productCode(p.getCode()).productName(p.getName()).stockQty(p.getStockQty())
                        .build()).toList())
                .build();
    }
}
