package com.tourpro.repository;

import com.tourpro.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByCode(String code);
    Page<Supplier> findByNameContainingIgnoreCaseAndStatus(String name, Supplier.SupplierStatus status, Pageable pageable);
    Page<Supplier> findByType(Supplier.SupplierType type, Pageable pageable);
}
