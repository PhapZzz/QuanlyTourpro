package com.tourpro.repository;

import com.tourpro.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByCode(String code);
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Product> findByType(Product.ProductType type, Pageable pageable);
    List<Product> findByStockQtyLessThan(int threshold);

    @Query("SELECT SUM(p.stockQty * p.buyPrice) FROM Product p WHERE p.status != 'INACTIVE'")
    BigDecimal totalInventoryValue();
}
