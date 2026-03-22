package com.tourpro.repository;

import com.tourpro.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByCode(String code);
    Page<Booking> findByCustomerId(Long customerId, Pageable pageable);
    Page<Booking> findByStatus(Booking.BookingStatus status, Pageable pageable);
    List<Booking> findByTourScheduleId(Long scheduleId);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE MONTH(b.createdAt)=:m AND YEAR(b.createdAt)=:y AND b.status IN ('PAID','COMPLETED')")
    BigDecimal sumRevenueByMonthYear(@Param("m") int month, @Param("y") int year);

    @Query("SELECT COUNT(b) FROM Booking b WHERE MONTH(b.createdAt)=:m AND YEAR(b.createdAt)=:y")
    long countByMonthYear(@Param("m") int month, @Param("y") int year);

    @Query("SELECT b.tourSchedule.tour.name, COUNT(b) as cnt FROM Booking b WHERE MONTH(b.createdAt)=:m AND YEAR(b.createdAt)=:y GROUP BY b.tourSchedule.tour ORDER BY cnt DESC")
    List<Object[]> topToursByBooking(@Param("m") int month, @Param("y") int year, Pageable pageable);
}
