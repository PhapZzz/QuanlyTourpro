package com.tourpro.repository;

import com.tourpro.entity.TourServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface TourServiceRepository extends JpaRepository<TourServiceItem, Long> {

    List<TourServiceItem> findByTour_IdOrderBySortOrderAsc(Long tourId);

    List<TourServiceItem> findByProduct_Id(Long productId);

    Optional<TourServiceItem> findByTour_IdAndProduct_Id(Long tourId, Long productId);

    boolean existsByTour_IdAndProduct_Id(Long tourId, Long productId);

    void deleteByTour_IdAndProduct_Id(Long tourId, Long productId);

    // Tổng chi phí dịch vụ của 1 tour
    @Query("""
           SELECT COALESCE(SUM(ts.product.buyPrice * ts.quantity), 0)
           FROM TourServiceItem ts
           WHERE ts.tour.id = :tourId
           """)
    BigDecimal sumCostByTourId(@Param("tourId") Long tourId);
}