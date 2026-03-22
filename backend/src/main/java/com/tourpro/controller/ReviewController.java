package com.tourpro.controller;

import com.tourpro.dto.*;
import com.tourpro.entity.CustomerReview;
import com.tourpro.repository.CustomerRepository;
import com.tourpro.repository.CustomerReviewRepository;
import com.tourpro.repository.TourRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final CustomerReviewRepository reviewRepo;
    private final CustomerRepository       customerRepo;
    private final TourRepository           tourRepo;

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<ApiResponse<List<ReviewDTO.Response>>> getByTour(@PathVariable Long tourId) {
        var reviews = reviewRepo.findByTourId(tourId).stream()
                .map(this::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok(reviews));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ReviewDTO.Response>>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.ok(
                reviewRepo.findByCustomerId(customerId).stream().map(this::toResponse).toList()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<ReviewDTO.Response>> create(
            @Valid @RequestBody ReviewDTO.CreateRequest req) {
        var customer = customerRepo.findById(req.getBookingId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        var tour = tourRepo.findById(req.getTourId())
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        var review = CustomerReview.builder()
                .customer(customer).tour(tour)
                .rating(req.getRating()).serviceRating(req.getServiceRating())
                .foodRating(req.getFoodRating()).guideRating(req.getGuideRating())
                .comment(req.getComment()).isVisible(true)
                .build();
        return ResponseEntity.ok(ApiResponse.ok(toResponse(reviewRepo.save(review))));
    }

    @PutMapping("/{id}/reply")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> reply(
            @PathVariable Long id,
            @RequestBody ReviewDTO.ReplyRequest req) {
        var review = reviewRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setReply(req.getReply());
        reviewRepo.save(review);
        return ResponseEntity.ok(ApiResponse.ok("Đã lưu phản hồi", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> hide(@PathVariable Long id) {
        var review = reviewRepo.findById(id).orElseThrow();
        review.setIsVisible(false);
        reviewRepo.save(review);
        return ResponseEntity.ok(ApiResponse.ok("Đã ẩn đánh giá", null));
    }

    private ReviewDTO.Response toResponse(CustomerReview r) {
        return ReviewDTO.Response.builder()
                .id(r.getId())
                .customerName(r.getCustomer().getFullName())
                .tourName(r.getTour().getName())
                .rating(r.getRating()).serviceRating(r.getServiceRating())
                .foodRating(r.getFoodRating()).guideRating(r.getGuideRating())
                .comment(r.getComment()).reply(r.getReply())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
