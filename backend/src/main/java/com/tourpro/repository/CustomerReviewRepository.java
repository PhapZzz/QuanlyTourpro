package com.tourpro.repository;

import com.tourpro.entity.CustomerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface CustomerReviewRepository extends JpaRepository<CustomerReview, Long> {
    List<CustomerReview> findByTourId(Long tourId);
    List<CustomerReview> findByCustomerId(Long customerId);
    Optional<CustomerReview> findByCustomerIdAndBookingId(Long customerId, Long bookingId);

    @Query("SELECT AVG(r.rating) FROM CustomerReview r WHERE r.tour.id=:tid")
    Double avgRatingByTour(@Param("tid") Long tourId);
}
