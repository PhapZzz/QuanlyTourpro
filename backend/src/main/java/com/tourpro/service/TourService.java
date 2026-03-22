package com.tourpro.service;

import com.tourpro.dto.PageResponse;
import com.tourpro.dto.TourDTO;
import com.tourpro.entity.*;
import com.tourpro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TourService {

    private final TourRepository           tourRepo;
    private final TourScheduleRepository   scheduleRepo;
    private final CustomerReviewRepository reviewRepo;
    private final EmployeeRepository       empRepo;

    public PageResponse<TourDTO.Response> getAll(String search, String type, String status, int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Tour> pg;
        if (type != null && !type.isBlank())
            pg = tourRepo.findByType(Tour.TourType.valueOf(type), p);
        else if (status != null && !status.isBlank())
            pg = tourRepo.findByStatus(Tour.TourStatus.valueOf(status), p);
        else if (search != null && !search.isBlank())
            pg = tourRepo.findByNameContainingIgnoreCaseAndStatus(search, Tour.TourStatus.ACTIVE, p);
        else
            pg = tourRepo.findAll(p);
        return toPageResponse(pg);
    }

    public TourDTO.Response getById(Long id) {
        return toResponse(tourRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found: " + id)));
    }

    public TourDTO.Response create(TourDTO.CreateRequest req) {
        String code = "T" + String.format("%03d", tourRepo.count() + 1);
        Tour tour = Tour.builder()
                .code(code).name(req.getName()).type(req.getType())
                .origin(req.getOrigin()).destination(req.getDestination())
                .days(req.getDays()).nights(req.getNights() != null ? req.getNights() : req.getDays() - 1)
                .capacity(req.getCapacity())
                .priceAdult(req.getPriceAdult()).priceChild(req.getPriceChild())
                .description(req.getDescription()).itinerary(req.getItinerary())
                .included(req.getIncluded()).notIncluded(req.getNotIncluded())
                .status(Tour.TourStatus.ACTIVE)
                .build();
        return toResponse(tourRepo.save(tour));
    }

    public TourDTO.Response update(Long id, TourDTO.UpdateRequest req) {
        Tour tour = tourRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
        if (req.getName()        != null) tour.setName(req.getName());
        if (req.getType()        != null) tour.setType(req.getType());
        if (req.getOrigin()      != null) tour.setOrigin(req.getOrigin());
        if (req.getDestination() != null) tour.setDestination(req.getDestination());
        if (req.getDays()        != null) tour.setDays(req.getDays());
        if (req.getNights()      != null) tour.setNights(req.getNights());
        if (req.getCapacity()    != null) tour.setCapacity(req.getCapacity());
        if (req.getPriceAdult()  != null) tour.setPriceAdult(req.getPriceAdult());
        if (req.getPriceChild()  != null) tour.setPriceChild(req.getPriceChild());
        if (req.getDescription() != null) tour.setDescription(req.getDescription());
        if (req.getItinerary()   != null) tour.setItinerary(req.getItinerary());
        if (req.getIncluded()    != null) tour.setIncluded(req.getIncluded());
        if (req.getStatus()      != null) tour.setStatus(req.getStatus());
        return toResponse(tourRepo.save(tour));
    }

    public TourDTO.Response addSchedule(Long tourId, TourDTO.AddScheduleRequest req) {
        Tour tour = tourRepo.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
        Employee guide = req.getGuideId() != null
                ? empRepo.findById(req.getGuideId()).orElse(null) : null;

        TourSchedule s = TourSchedule.builder()
                .tour(tour).departureDate(req.getDepartureDate())
                .capacity(req.getCapacity()).booked(0)
                .guide(guide)
                .status(TourSchedule.ScheduleStatus.OPEN)
                .build();
        scheduleRepo.save(s);
        return toResponse(tour);
    }

    private TourDTO.Response toResponse(Tour t) {
        Double avgRating = reviewRepo.avgRatingByTour(t.getId());
        List<TourDTO.ScheduleResponse> schedules = scheduleRepo
                .findUpcomingByTour(t.getId(), LocalDate.now())
                .stream().map(s -> TourDTO.ScheduleResponse.builder()
                        .id(s.getId()).departureDate(s.getDepartureDate())
                        .capacity(s.getCapacity()).booked(s.getBooked())
                        .available(s.getCapacity() - s.getBooked())
                        .status(s.getStatus().name()).build())
                .toList();

        return TourDTO.Response.builder()
                .id(t.getId()).code(t.getCode()).name(t.getName())
                .type(t.getType()   != null ? t.getType().name()   : null)
                .status(t.getStatus() != null ? t.getStatus().name() : null)
                .origin(t.getOrigin()).destination(t.getDestination())
                .days(t.getDays()).nights(t.getNights()).capacity(t.getCapacity())
                .priceAdult(t.getPriceAdult()).priceChild(t.getPriceChild())
                .description(t.getDescription()).itinerary(t.getItinerary())
                .included(t.getIncluded()).notIncluded(t.getNotIncluded())
                .avgRating(avgRating).schedules(schedules)
                .build();
    }

    private PageResponse<TourDTO.Response> toPageResponse(Page<Tour> pg) {
        return PageResponse.<TourDTO.Response>builder()
                .content(pg.getContent().stream().map(this::toResponse).toList())
                .page(pg.getNumber()).size(pg.getSize())
                .totalElements(pg.getTotalElements()).totalPages(pg.getTotalPages())
                .build();
    }
}
