package com.tourpro.repository;

import com.tourpro.entity.TourSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {
    List<TourSchedule> findByTourIdAndStatus(Long tourId, TourSchedule.ScheduleStatus status);
    List<TourSchedule> findByDepartureDateBetween(LocalDate from, LocalDate to);

    @Query("SELECT s FROM TourSchedule s WHERE s.tour.id=:tid AND s.departureDate>=:today AND s.status='OPEN'")
    List<TourSchedule> findUpcomingByTour(@Param("tid") Long tourId, @Param("today") LocalDate today);
}
