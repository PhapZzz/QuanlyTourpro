package com.tourpro.service;

import com.tourpro.dto.PageResponse;
import com.tourpro.dto.TourDTO;
import com.tourpro.entity.*;
import com.tourpro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class TourService {

    private final TourRepository            tourRepo;
    private final TourScheduleRepository    scheduleRepo;
    private final TourServiceRepository     tourSvcRepo;   // junction table
    private final ProductRepository         productRepo;
    private final CustomerReviewRepository  reviewRepo;
    private final EmployeeRepository        empRepo;

    // ─────────────────────────────────────────────────────────
    // CRUD Tour
    // ─────────────────────────────────────────────────────────

    public PageResponse<TourDTO.Response> getAll(String search, String type,
                                                  String status, int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Tour> pg;
        if (type   != null && !type.isBlank())
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
                .days(req.getDays())
                .nights(req.getNights() != null ? req.getNights() : req.getDays() - 1)
                .capacity(req.getCapacity())
                .priceAdult(req.getPriceAdult()).priceChild(req.getPriceChild())
                .description(req.getDescription()).itinerary(req.getItinerary())
                .included(req.getIncluded()).notIncluded(req.getNotIncluded())
                .status(Tour.TourStatus.ACTIVE)
                .build();
        Tour saved = tourRepo.save(tour);

        // Thêm dịch vụ ngay khi tạo tour (nếu có)
        if (req.getServices() != null) {
            for (TourDTO.AddServiceRequest svc : req.getServices()) {
                addServiceInternal(saved, svc);
            }
        }
        return toResponse(saved);
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
        if (req.getNotIncluded() != null) tour.setNotIncluded(req.getNotIncluded());
        if (req.getStatus()      != null) tour.setStatus(req.getStatus());
        return toResponse(tourRepo.save(tour));
    }

    // ─────────────────────────────────────────────────────────
    // Quản lý dịch vụ trong tour (Many-to-Many)
    // ─────────────────────────────────────────────────────────

    /** Thêm 1 dịch vụ vào tour */
    public TourDTO.Response addService(Long tourId, TourDTO.AddServiceRequest req) {
        Tour tour = tourRepo.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        if (tourSvcRepo.existsByTour_IdAndProduct_Id(tourId, req.getProductId())) {
            throw new RuntimeException("Dịch vụ này đã có trong tour. Dùng API cập nhật để thay đổi số lượng.");
        }
        addServiceInternal(tour, req);
        return toResponse(tour);
    }

    /** Cập nhật số lượng / ghi chú dịch vụ */
    public TourDTO.Response updateService(Long tourId, Long productId,
                                           TourDTO.UpdateServiceRequest req) {
        TourServiceItem ts = tourSvcRepo.findByTour_IdAndProduct_Id(tourId, productId)
                .orElseThrow(() -> new RuntimeException("Dịch vụ không tồn tại trong tour"));
        if (req.getQuantity()  != null) ts.setQuantity(req.getQuantity());
        if (req.getNote()      != null) ts.setNote(req.getNote());
        if (req.getSortOrder() != null) ts.setSortOrder(req.getSortOrder());
        tourSvcRepo.save(ts);
        return toResponse(tourRepo.findById(tourId).orElseThrow());
    }

    /** Xóa 1 dịch vụ khỏi tour */
    public TourDTO.Response removeService(Long tourId, Long productId) {
        if (!tourSvcRepo.existsByTour_IdAndProduct_Id(tourId, productId)) {
            throw new RuntimeException("Dịch vụ không tồn tại trong tour");
        }
        tourSvcRepo.deleteByTour_IdAndProduct_Id(tourId, productId);
        return toResponse(tourRepo.findById(tourId).orElseThrow());
    }

    /** Lấy danh sách tất cả dịch vụ của 1 tour */
    public List<TourDTO.ServiceItem> getServices(Long tourId) {
        return tourSvcRepo.findByTour_IdOrderBySortOrderAsc(tourId)
                .stream().map(this::toServiceItem).toList();
    }

    /** Tính giá tour tự động từ tổng chi phí dịch vụ */
    public TourDTO.Response recalculatePrice(
            Long tourId,
            double marginPercent
    ) {

        // Fetch tour với services để tính giá
        Tour tour = tourRepo.findByIdWithServices(tourId)
                .orElseThrow(() ->
                        new RuntimeException("Tour not found"));

        // ================= SỨC CHỨA =================

        int capacity =
                tour.getCapacity() != null
                        && tour.getCapacity() > 0
                        ? tour.getCapacity()
                        : 1;

        // ================= TÍNH TỔNG CHI PHÍ THEO LOẠI DỊCH VỤ =================

        BigDecimal totalCost = calculateTotalCostByType(tour);

        // ================= GIÁ COST / NGƯỜI =================

        BigDecimal costPerPerson =
                totalCost.divide(
                        BigDecimal.valueOf(capacity),
                        0,
                        java.math.RoundingMode.HALF_UP
                );

        // ================= MARGIN =================

        BigDecimal margin =
                BigDecimal.valueOf(marginPercent)
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                java.math.RoundingMode.HALF_UP
                        );

        // ================= GIÁ NGƯỜI LỚN =================

        BigDecimal adultPrice =
                costPerPerson.multiply(
                        BigDecimal.ONE.add(margin)
                );

        // làm tròn đẹp
        adultPrice = adultPrice.setScale(
                -3,
                java.math.RoundingMode.HALF_UP
        );

        // ================= GIÁ TRẺ EM =================

        BigDecimal childPrice =
                adultPrice.multiply(
                        BigDecimal.valueOf(0.75)
                );

        childPrice = childPrice.setScale(
                -3,
                java.math.RoundingMode.HALF_UP
        );

        // ================= SAVE =================

        tour.setPriceAdult(adultPrice);

        tour.setPriceChild(childPrice);

        Tour saved = tourRepo.save(tour);

        return toResponse(saved);
    }

    /**
     * Tính tổng chi phí dịch vụ dựa trên loại dịch vụ
     * - FLIGHT: tính chuyến đi + chuyến về (2 lần)
     * - HOTEL: tính theo số đêm (nights)
     * - FOOD: 3 bữa/ngày × số ngày
     * - VEHICLE: tính theo ngày
     * - ACTIVITY: theo vé (như cũ)
     */
    private BigDecimal calculateTotalCostByType(Tour tour) {
        BigDecimal total = BigDecimal.ZERO;

        int days = tour.getDays() != null ? tour.getDays() : 1;
        int nights = tour.getNights() != null ? tour.getNights() : (days - 1);

        if (tour.getServices() == null) {
            return total;
        }

        for (TourServiceItem ts : tour.getServices()) {
            Product p = ts.getProduct();
            BigDecimal unitPrice = p.getBuyPrice();
            int qty = ts.getQuantity() != null ? ts.getQuantity() : 1;

            BigDecimal itemCost = BigDecimal.ZERO;

            if (p.getType() == null) {
                // Không có type thì tính như cũ
                itemCost = unitPrice.multiply(BigDecimal.valueOf(qty));
            } else {
                switch (p.getType()) {
                    case FLIGHT:
                        // Di chuyển: tính chuyến đi + chuyến về = 2 lần
                        // quantity ở đây là số lượng vé một chiều
                        itemCost = unitPrice.multiply(BigDecimal.valueOf(qty * 2));
                        break;

                    case HOTEL:
                        // Khách sạn: tính theo số đêm
                        // quantity là số phòng, nhân với số đêm
                        itemCost = unitPrice.multiply(
                                BigDecimal.valueOf(qty * nights)
                        );
                        break;

                    case FOOD:
                        // Suất ăn: 3 bữa/ngày × số ngày × số lượng
                        // quantity là số suất ăn mỗi bữa
                        itemCost = unitPrice.multiply(
                                BigDecimal.valueOf(qty * 3 * days)
                        );
                        break;

                    case VEHICLE:
                        // Xe: tính theo ngày
                        itemCost = unitPrice.multiply(
                                BigDecimal.valueOf(qty * days)
                        );
                        break;

                    case ACTIVITY:
                    case OTHER:
                    default:
                        // Vui chơi: theo vé như cũ
                        itemCost = unitPrice.multiply(BigDecimal.valueOf(qty));
                        break;
                }
            }

            total = total.add(itemCost);
        }

        return total;
    }

    // ─────────────────────────────────────────────────────────
    // Lịch khởi hành
    // ─────────────────────────────────────────────────────────

    public TourDTO.Response addSchedule(Long tourId, TourDTO.AddScheduleRequest req) {
        Tour tour = tourRepo.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
        Employee guide = req.getGuideId() != null
                ? empRepo.findById(req.getGuideId()).orElse(null) : null;
        TourSchedule s = TourSchedule.builder()
                .tour(tour).departureDate(req.getDepartureDate())
                .capacity(req.getCapacity()).booked(0).guide(guide)
                .status(TourSchedule.ScheduleStatus.OPEN).build();

        for (TourServiceItem ts : tour.getServices()) {

            Product product = ts.getProduct();

            Integer currentQty =
                    product.getStockQty() != null
                            ? product.getStockQty()
                            : 0;

            int requiredQty = ts.getQuantity();

            // check tồn kho
            if (currentQty < requiredQty) {

                throw new RuntimeException(
                        "Dịch vụ "
                                + product.getName()
                                + " không đủ số lượng tồn"
                );
            }

            // trừ kho
            int newQty = currentQty - requiredQty;

            product.setStockQty(newQty);

            // auto update status
            if (newQty <= 0) {

                product.setStatus(
                        Product.ProductStatus.OUT_OF_STOCK
                );
            }

            productRepo.save(product);
        }
        scheduleRepo.save(s);
        return toResponse(tour);
    }

    // ─────────────────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────────────────

    private void addServiceInternal(Tour tour, TourDTO.AddServiceRequest req) {
        Product product = productRepo.findById(req.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + req.getProductId()));
        int order = req.getSortOrder() != null ? req.getSortOrder()
                : tourSvcRepo.findByTour_IdOrderBySortOrderAsc(tour.getId()).size() + 1;
        TourServiceItem ts = TourServiceItem.builder()
                .tour(tour).product(product)
                .quantity(req.getQuantity())
                .note(req.getNote())
                .sortOrder(order)
                .build();
        tourSvcRepo.save(ts);
    }

    private TourDTO.ServiceItem toServiceItem(TourServiceItem ts) {
        Product p = ts.getProduct();
        BigDecimal subtotal = p.getBuyPrice()
                .multiply(BigDecimal.valueOf(ts.getQuantity()));
        return TourDTO.ServiceItem.builder()
                .tourServiceId(ts.getId())
                .productId(p.getId())
                .productCode(p.getCode())
                .productName(p.getName())
                .productType(p.getType() != null ? p.getType().name() : null)
                .supplierName(p.getSupplier() != null ? p.getSupplier().getName() : null)
                .quantity(ts.getQuantity())
                .note(ts.getNote())
                .sortOrder(ts.getSortOrder())
                .buyPrice(p.getBuyPrice())
                .sellPrice(p.getSellPrice())
                .subtotalCost(subtotal)
                .build();
    }

    public TourDTO.Response toResponse(Tour t) {

        Double avgRating = reviewRepo.avgRatingByTour(t.getId());

        BigDecimal estimatedCost = tourSvcRepo.sumCostByTourId(t.getId());

        List<TourDTO.ServiceItem> services = tourSvcRepo
                .findByTour_IdOrderBySortOrderAsc(t.getId())
                .stream()
                .map(this::toServiceItem)
                .toList();

        // =====================================================
        // LOAD ALL SCHEDULES + AUTO UPDATE STATUS
        // =====================================================

        List<TourDTO.ScheduleResponse> schedules = scheduleRepo
                .findByTour_IdOrderByDepartureDateAsc(t.getId())
                .stream()
                .map(s -> {

                    // CANCELLED giữ nguyên
                    if (s.getStatus() != TourSchedule.ScheduleStatus.CANCELLED) {

                        // Tour đã qua ngày
                        if (s.getDepartureDate().isBefore(LocalDate.now())) {

                            if (s.getStatus() != TourSchedule.ScheduleStatus.COMPLETED) {
                                s.setStatus(TourSchedule.ScheduleStatus.COMPLETED);
                                scheduleRepo.save(s);
                            }

                        }

                        // Tour đầy chỗ
                        else if (s.getBooked() >= s.getCapacity()) {

                            if (s.getStatus() != TourSchedule.ScheduleStatus.FULL) {
                                s.setStatus(TourSchedule.ScheduleStatus.FULL);
                                scheduleRepo.save(s);
                            }

                        }

                        // Tour còn mở
                        else {

                            if (s.getStatus() != TourSchedule.ScheduleStatus.OPEN) {
                                s.setStatus(TourSchedule.ScheduleStatus.OPEN);
                                scheduleRepo.save(s);
                            }

                        }
                    }

                    return TourDTO.ScheduleResponse.builder()
                            .id(s.getId())
                            .departureDate(s.getDepartureDate())
                            .capacity(s.getCapacity())
                            .booked(s.getBooked())
                            .available(s.getCapacity() - s.getBooked())
                            .status(s.getStatus().name())
                            .build();
                })
                .toList();

        return TourDTO.Response.builder()
                .id(t.getId())
                .code(t.getCode())
                .name(t.getName())
                .type(t.getType() != null ? t.getType().name() : null)
                .status(t.getStatus() != null ? t.getStatus().name() : null)
                .origin(t.getOrigin())
                .destination(t.getDestination())
                .days(t.getDays())
                .nights(t.getNights())
                .capacity(t.getCapacity())
                .priceAdult(t.getPriceAdult())
                .priceChild(t.getPriceChild())
                .description(t.getDescription())
                .itinerary(t.getItinerary())
                .included(t.getIncluded())
                .notIncluded(t.getNotIncluded())
                .estimatedCost(estimatedCost)
                .avgRating(avgRating)
                .services(services)
                .schedules(schedules)
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
