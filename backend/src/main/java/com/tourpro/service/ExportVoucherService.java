package com.tourpro.service;

import com.tourpro.dto.*;
import com.tourpro.entity.*;
import com.tourpro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExportVoucherService {

    private final ExportVoucherRepository exportVoucherRepository;
    private final ExportDetailRepository exportDetailRepository;
    private final BookingRepository bookingRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<ExportVoucherDTO> getAll() {
        return exportVoucherRepository.findAllWithDetails().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public ExportVoucherDTO getById(Long id) {
        ExportVoucher voucher = exportVoucherRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new RuntimeException("ExportVoucher not found"));
        return toDTO(voucher);
    }

    public List<ExportVoucherDTO> getByDateBetween(LocalDate from, LocalDate to) {
        // For date range, we need to fetch details separately
        List<ExportVoucher> vouchers = exportVoucherRepository.findByDateBetween(from, to);
        
        // Load details for each voucher
        for (ExportVoucher v : vouchers) {
            List<ExportDetail> details = exportDetailRepository.findByVoucherId(v.getId());
            v.setDetails(details);
        }
        
        return vouchers.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public ExportVoucherDTO create(ExportVoucherCreateDTO createDTO, Long userId) {
        // Generate code
        String code = "EV" + System.currentTimeMillis();
        
        // Get booking
        Booking booking = bookingRepository.findById(createDTO.getBookingId())
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Get user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Calculate total
        BigDecimal total = BigDecimal.ZERO;
        if (createDTO.getDetails() != null) {
            for (ExportDetailCreateDTO detailDTO : createDTO.getDetails()) {
                total = total.add(detailDTO.getUnitPrice().multiply(BigDecimal.valueOf(detailDTO.getQty())));
            }
        }
        
        // Create voucher
        ExportVoucher voucher = ExportVoucher.builder()
            .code(code)
            .date(LocalDate.now())
            .booking(booking)
            .total(total)
            .note(createDTO.getNote())
            .createdBy(user)
            .build();
        
        voucher = exportVoucherRepository.save(voucher);
        
        // Create details
        if (createDTO.getDetails() != null) {
            for (ExportDetailCreateDTO detailDTO : createDTO.getDetails()) {
                Product product = productRepository.findById(detailDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
                
                BigDecimal amount = detailDTO.getUnitPrice().multiply(BigDecimal.valueOf(detailDTO.getQty()));
                
                ExportDetail detail = ExportDetail.builder()
                    .voucher(voucher)
                    .product(product)
                    .qty(detailDTO.getQty())
                    .unitPrice(detailDTO.getUnitPrice())
                    .amount(amount)
                    .build();
                
                exportDetailRepository.save(detail);
            }
        }
        
        return toDTO(voucher);
    }

    @Transactional
    public void delete(Long id) {
        ExportVoucher voucher = exportVoucherRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("ExportVoucher not found"));
        
        // Delete details first
        List<ExportDetail> details = exportDetailRepository.findByVoucherId(id);
        exportDetailRepository.deleteAll(details);
        
        exportVoucherRepository.delete(voucher);
    }

    // Profit report by month
    public List<ProfitReportDTO> getProfitReportByMonth(int year, int month) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        
        List<ExportVoucher> vouchers = exportVoucherRepository.findByDateBetween(from, to);
        
        return vouchers.stream()
            .map(v -> {
                BigDecimal revenue = v.getTotal() != null ? v.getTotal() : BigDecimal.ZERO;
                // Cost = 70% of revenue (假设成本是70%)
                BigDecimal cost = revenue.multiply(BigDecimal.valueOf(0.7));
                BigDecimal profit = revenue.subtract(cost);
                
                return ProfitReportDTO.builder()
                    .date(v.getDate())
                    .revenue(revenue)
                    .cost(cost)
                    .profit(profit)
                    .exportCount(1)
                    .build();
            })
            .collect(Collectors.toList());
    }

    // Summary profit by month
    public ProfitReportDTO getMonthlyProfitSummary(int year, int month) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        
        List<ExportVoucher> vouchers = exportVoucherRepository.findByDateBetween(from, to);
        
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        
        for (ExportVoucher v : vouchers) {
            BigDecimal revenue = v.getTotal() != null ? v.getTotal() : BigDecimal.ZERO;
            totalRevenue = totalRevenue.add(revenue);
            totalCost = totalCost.add(revenue.multiply(BigDecimal.valueOf(0.7)));
        }
        
        return ProfitReportDTO.builder()
            .date(from)
            .revenue(totalRevenue)
            .cost(totalCost)
            .profit(totalRevenue.subtract(totalCost))
            .exportCount(vouchers.size())
            .build();
    }

    // Yearly profit report
    public List<ProfitReportDTO> getYearlyProfitReport(int year) {
        List<ProfitReportDTO> result = new java.util.ArrayList<>();
        
        for (int month = 1; month <= 12; month++) {
            LocalDate from = LocalDate.of(year, month, 1);
            LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
            
            List<ExportVoucher> vouchers = exportVoucherRepository.findByDateBetween(from, to);
            
            BigDecimal totalRevenue = BigDecimal.ZERO;
            for (ExportVoucher v : vouchers) {
                BigDecimal revenue = v.getTotal() != null ? v.getTotal() : BigDecimal.ZERO;
                totalRevenue = totalRevenue.add(revenue);
            }
            
            BigDecimal cost = totalRevenue.multiply(BigDecimal.valueOf(0.7));
            BigDecimal profit = totalRevenue.subtract(cost);
            
            result.add(ProfitReportDTO.builder()
                .date(from)
                .revenue(totalRevenue)
                .cost(cost)
                .profit(profit)
                .exportCount(vouchers.size())
                .build());
        }
        
        return result;
    }

    private ExportVoucherDTO toDTO(ExportVoucher voucher) {
        List<ExportDetailDTO> detailDTOs = null;
        if (voucher.getDetails() != null) {
            detailDTOs = voucher.getDetails().stream()
                .map(d -> ExportDetailDTO.builder()
                    .id(d.getId())
                    .productId(d.getProduct().getId())
                    .productName(d.getProduct().getName())
                    .productCode(d.getProduct().getCode())
                    .qty(d.getQty())
                    .unitPrice(d.getUnitPrice())
                    .amount(d.getAmount())
                    .build())
                .collect(Collectors.toList());
        }
        
        String bookingCode = voucher.getBooking() != null ? voucher.getBooking().getCode() : null;
        String tourName = voucher.getBooking() != null && voucher.getBooking().getTourSchedule() != null 
            ? voucher.getBooking().getTourSchedule().getTour().getName() : null;
        String customerName = voucher.getBooking() != null && voucher.getBooking().getCustomer() != null
            ? voucher.getBooking().getCustomer().getFullName() : null;
        String createdByName = voucher.getCreatedBy() != null ? voucher.getCreatedBy().getFullName() : null;
        
        return ExportVoucherDTO.builder()
            .id(voucher.getId())
            .code(voucher.getCode())
            .date(voucher.getDate())
            .bookingId(voucher.getBooking() != null ? voucher.getBooking().getId() : null)
            .bookingCode(bookingCode)
            .tourName(tourName)
            .customerName(customerName)
            .total(voucher.getTotal())
            .note(voucher.getNote())
            .createdByName(createdByName)
            .createdAt(voucher.getCreatedAt())
            .details(detailDTOs)
            .build();
    }
}