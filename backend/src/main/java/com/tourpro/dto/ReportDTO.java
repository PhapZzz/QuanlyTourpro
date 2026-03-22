package com.tourpro.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class ReportDTO {

    @Data @Builder
    public static class DashboardStats {
        private Long totalTours;
        private Long totalBookingsThisMonth;
        private BigDecimal revenueThisMonth;
        private Long totalEmployees;
        private Long pendingLeaveRequests;
        private Long pendingBookings;
        private Long totalCustomers;
    }

    @Data @Builder
    public static class RevenueReport {
        private Integer month;
        private Integer year;
        private BigDecimal totalRevenue;
        private BigDecimal totalCost;
        private BigDecimal grossProfit;
        private Double profitMargin;
        private Long totalBookings;
        private Long totalCustomers;
        private List<TourRevenueItem> byTour;
    }

    @Data @Builder
    public static class TourRevenueItem {
        private String tourName;
        private Long bookings;
        private BigDecimal revenue;
        private BigDecimal cost;
        private BigDecimal profit;
    }

    @Data @Builder
    public static class HRReport {
        private Integer month;
        private Integer year;
        private Long totalEmployees;
        private Long activeEmployees;
        private BigDecimal totalSalary;
        private BigDecimal totalBonus;
        private Long pendingLeaves;
        private Long approvedLeaves;
    }

    @Data @Builder
    public static class WarehouseReport {
        private Integer month;
        private Integer year;
        private Integer totalProducts;
        private BigDecimal inventoryValue;
        private BigDecimal totalImportValue;
        private Integer importVouchers;
        private List<LowStockItem> lowStockItems;
    }

    @Data @Builder
    public static class LowStockItem {
        private String productCode;
        private String productName;
        private Integer stockQty;
    }
}
