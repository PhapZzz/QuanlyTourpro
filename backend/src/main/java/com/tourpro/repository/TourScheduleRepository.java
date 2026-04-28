package com.tourpro.repository;

import com.tourpro.entity.TourSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {

    // Toàn bộ lịch của tour
    List<TourSchedule> findByTour_IdOrderByDepartureDateAsc(Long tourId);

    // Upcoming (nếu còn dùng)
    List<TourSchedule> findByTour_IdAndDepartureDateGreaterThanEqualOrderByDepartureDateAsc(
            Long tourId,
            LocalDate today
    );
}