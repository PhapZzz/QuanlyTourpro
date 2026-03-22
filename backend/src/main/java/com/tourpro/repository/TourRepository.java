package com.tourpro.repository;

import com.tourpro.entity.Tour;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TourRepository extends JpaRepository<Tour, Long> {
    Optional<Tour> findByCode(String code);
    Page<Tour> findByNameContainingIgnoreCaseAndStatus(String name, Tour.TourStatus status, Pageable pageable);
    Page<Tour> findByType(Tour.TourType type, Pageable pageable);
    Page<Tour> findByDestinationContainingIgnoreCase(String destination, Pageable pageable);
    Page<Tour> findByStatus(Tour.TourStatus status, Pageable pageable);
}
