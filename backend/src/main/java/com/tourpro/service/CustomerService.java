package com.tourpro.service;

import com.tourpro.dto.CustomerDTO;
import com.tourpro.dto.PageResponse;
import com.tourpro.entity.Booking;
import com.tourpro.entity.Customer;
import com.tourpro.repository.BookingRepository;
import com.tourpro.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepo;
    private final BookingRepository  bookingRepo;

    public PageResponse<CustomerDTO.Response> getAll(String search, String segment, int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Customer> pg;
        if (search != null && !search.isBlank()) {
            pg = customerRepo.findByFullNameContainingIgnoreCaseOrPhoneContaining(search, search, p);
        } else if (segment != null && !segment.isBlank()) {
            pg = customerRepo.findBySegment(Customer.CustomerSegment.valueOf(segment), p);
        } else {
            pg = customerRepo.findAll(p);
        }
        return toPageResponse(pg);
    }

    public CustomerDTO.Response getById(Long id) {
        return toResponse(customerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id)));
    }

    public CustomerDTO.Response create(CustomerDTO.CreateRequest req) {
        String code = String.format("KH-%05d", customerRepo.count() + 1);
        Customer c = Customer.builder()
                .code(code).fullName(req.getFullName()).gender(req.getGender())
                .dob(req.getDob()).phone(req.getPhone()).email(req.getEmail())
                .cccdPassport(req.getCccdPassport()).address(req.getAddress())
                .source(req.getSource())
                .segment(req.getSegment() != null ? req.getSegment() : Customer.CustomerSegment.NEW)
                .preferences(req.getPreferences()).specialRequest(req.getSpecialRequest())
                .loyaltyPoints(0).build();
        return toResponse(customerRepo.save(c));
    }

    public CustomerDTO.Response update(Long id, CustomerDTO.UpdateRequest req) {
        Customer c = customerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
        if (req.getFullName()  != null) c.setFullName(req.getFullName());
        if (req.getPhone()     != null) c.setPhone(req.getPhone());
        if (req.getEmail()     != null) c.setEmail(req.getEmail());
        if (req.getAddress()   != null) c.setAddress(req.getAddress());
        if (req.getSegment()   != null) c.setSegment(req.getSegment());
        if (req.getPreferences()     != null) c.setPreferences(req.getPreferences());
        if (req.getSpecialRequest()  != null) c.setSpecialRequest(req.getSpecialRequest());
        return toResponse(customerRepo.save(c));
    }

    public void delete(Long id) {
        customerRepo.deleteById(id);
    }

    public void addLoyaltyPoints(Long id, int points) {
        Customer c = customerRepo.findById(id).orElseThrow();
        c.setLoyaltyPoints(c.getLoyaltyPoints() + points);
        updateSegment(c);
        customerRepo.save(c);
    }

    private void updateSegment(Customer c) {
        List<Booking> bookings = bookingRepo.findByCustomerId(c.getId(), Pageable.unpaged()).getContent();
        long count = bookings.size();
        BigDecimal total = bookings.stream().map(Booking::getTotalPrice)
                .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (count >= 8 || total.compareTo(new BigDecimal("50000000")) >= 0)
            c.setSegment(Customer.CustomerSegment.VIP);
        else if (count >= 4 || total.compareTo(new BigDecimal("20000000")) >= 0)
            c.setSegment(Customer.CustomerSegment.LOYAL);
        else if (count >= 2)
            c.setSegment(Customer.CustomerSegment.REGULAR);
    }

    private CustomerDTO.Response toResponse(Customer c) {
        return CustomerDTO.Response.builder()
                .id(c.getId()).code(c.getCode()).fullName(c.getFullName())
                .gender(c.getGender() != null ? c.getGender().name() : null)
                .dob(c.getDob()).phone(c.getPhone()).email(c.getEmail())
                .cccdPassport(c.getCccdPassport()).address(c.getAddress())
                .source(c.getSource()  != null ? c.getSource().name()  : null)
                .segment(c.getSegment() != null ? c.getSegment().name() : null)
                .preferences(c.getPreferences()).specialRequest(c.getSpecialRequest())
                .loyaltyPoints(c.getLoyaltyPoints()).createdAt(c.getCreatedAt())
                .build();
    }

    private PageResponse<CustomerDTO.Response> toPageResponse(Page<Customer> pg) {
        return PageResponse.<CustomerDTO.Response>builder()
                .content(pg.getContent().stream().map(this::toResponse).toList())
                .page(pg.getNumber()).size(pg.getSize())
                .totalElements(pg.getTotalElements()).totalPages(pg.getTotalPages())
                .build();
    }
}
