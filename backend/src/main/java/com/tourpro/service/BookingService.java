package com.tourpro.service;

import com.tourpro.dto.BookingDTO;
import com.tourpro.dto.PageResponse;
import com.tourpro.entity.*;
import com.tourpro.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BookingService {

    private final BookingRepository      bookingRepo;
    private final CustomerRepository     customerRepo;
    private final TourScheduleRepository scheduleRepo;
    private final UserRepository         userRepo;
    private final CustomerService        customerService;

    public BookingDTO.Response create(BookingDTO.CreateRequest req, String createdByUsername) {
        Customer customer = customerRepo.findById(req.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        TourSchedule schedule = scheduleRepo.findById(req.getTourScheduleId())
                .orElseThrow(() -> new RuntimeException("Tour schedule not found"));

        int totalPeople = req.getAdults() + (req.getChildren() != null ? req.getChildren() : 0);
        int available = schedule.getCapacity() - schedule.getBooked();
        if (available < totalPeople)
            throw new RuntimeException("Not enough slots. Available: " + available);

        BigDecimal priceAdult = schedule.getTour().getPriceAdult();
        BigDecimal priceChild = schedule.getTour().getPriceChild() != null
                ? schedule.getTour().getPriceChild()
                : priceAdult.multiply(new BigDecimal("0.7"));

        BigDecimal totalPrice = priceAdult.multiply(new BigDecimal(req.getAdults()))
                .add(priceChild.multiply(new BigDecimal(req.getChildren() != null ? req.getChildren() : 0)));

        // VIP discount 5%
        BigDecimal discount = req.getDiscount() != null ? req.getDiscount() : BigDecimal.ZERO;
        if (customer.getSegment() == Customer.CustomerSegment.VIP)
            discount = discount.add(totalPrice.multiply(new BigDecimal("0.05")));

        BigDecimal finalPrice = totalPrice.subtract(discount);
        BigDecimal deposit    = finalPrice.multiply(new BigDecimal("0.30")).setScale(0, RoundingMode.HALF_UP);

        String code = "DT-" + LocalDate.now().getYear() + "-"
                + String.format("%04d", bookingRepo.count() + 1);

        User createdBy = userRepo.findByUsername(createdByUsername).orElse(null);

        Booking booking = Booking.builder()
                .code(code).customer(customer).tourSchedule(schedule)
                .adults(req.getAdults())
                .children(req.getChildren() != null ? req.getChildren() : 0)
                .totalPrice(finalPrice).deposit(deposit).discount(discount)
                .paymentMethod(req.getPaymentMethod())
                .paymentStatus(Booking.PaymentStatus.UNPAID)
                .status(Booking.BookingStatus.PENDING)
                .note(req.getNote()).createdBy(createdBy)
                .build();

        Booking saved = bookingRepo.save(booking);

        // Update schedule booked count
        schedule.setBooked(schedule.getBooked() + totalPeople);
        if (schedule.getBooked() >= schedule.getCapacity())
            schedule.setStatus(TourSchedule.ScheduleStatus.FULL);
        scheduleRepo.save(schedule);

        // Award loyalty points: 1 point per 10,000 VND
        int points = finalPrice.divide(new BigDecimal("10000"), 0, RoundingMode.DOWN).intValue();
        customerService.addLoyaltyPoints(customer.getId(), points);

        return toResponse(saved);
    }

    public BookingDTO.Response updateStatus(Long id, BookingDTO.UpdateStatusRequest req) {
        Booking b = bookingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        b.setStatus(req.getStatus());
        if (req.getNote()         != null) b.setNote(req.getNote());
        if (req.getCancelReason() != null) b.setCancelReason(req.getCancelReason());
        if (req.getStatus() == Booking.BookingStatus.PAID)
            b.setPaymentStatus(Booking.PaymentStatus.PAID);
        return toResponse(bookingRepo.save(b));
    }

    public PageResponse<BookingDTO.Response> getAll(String status, int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Booking> pg = (status != null && !status.isBlank())
                ? bookingRepo.findByStatus(Booking.BookingStatus.valueOf(status), p)
                : bookingRepo.findAll(p);
        return toPageResponse(pg);
    }

    public PageResponse<BookingDTO.Response> getByCustomer(Long customerId, int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return toPageResponse(bookingRepo.findByCustomerId(customerId, p));
    }

    public BookingDTO.Response getById(Long id) {
        return toResponse(bookingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found")));
    }

    private BookingDTO.Response toResponse(Booking b) {
        TourSchedule schedule = b.getTourSchedule();
        return BookingDTO.Response.builder()
                .id(b.getId()).code(b.getCode())
                .customerName(b.getCustomer().getFullName())
                .customerPhone(b.getCustomer().getPhone())
                .tourName(schedule.getTour().getName())
                .destination(schedule.getTour().getDestination())
                .departureDate(schedule.getDepartureDate())
                .adults(b.getAdults()).children(b.getChildren())
                .totalPrice(b.getTotalPrice()).deposit(b.getDeposit()).discount(b.getDiscount())
                .paymentMethod(b.getPaymentMethod()   != null ? b.getPaymentMethod().name()   : null)
                .paymentStatus(b.getPaymentStatus()   != null ? b.getPaymentStatus().name()   : null)
                .status(b.getStatus()                 != null ? b.getStatus().name()           : null)
                .note(b.getNote())
                .createdBy(b.getCreatedBy() != null ? b.getCreatedBy().getFullName() : null)
                .createdAt(b.getCreatedAt())
                .build();
    }

    private PageResponse<BookingDTO.Response> toPageResponse(Page<Booking> pg) {
        return PageResponse.<BookingDTO.Response>builder()
                .content(pg.getContent().stream().map(this::toResponse).toList())
                .page(pg.getNumber()).size(pg.getSize())
                .totalElements(pg.getTotalElements()).totalPages(pg.getTotalPages())
                .build();
    }
}
