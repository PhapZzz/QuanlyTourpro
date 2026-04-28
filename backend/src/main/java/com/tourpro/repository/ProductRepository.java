package com.tourpro.repository;

import com.tourpro.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query(value = """
    SELECT
        p.code as productCode,
        p.name as productName,

        COALESCE(SUM(id.qty),0) as totalImportQty,

        0 as totalExportQty,

        COALESCE(SUM(id.qty * id.unit_price),0) as totalImportValue,

        0 as totalRevenue

    FROM products p
    LEFT JOIN import_voucher_details id
        ON p.id = id.product_id
    LEFT JOIN import_vouchers iv
        ON iv.id = id.import_voucher_id

    WHERE
        (:month IS NULL OR MONTH(iv.created_at) = :month)
        AND
        (:year IS NULL OR YEAR(iv.created_at) = :year)

    GROUP BY p.id, p.code, p.name
""", nativeQuery = true)
    List<Object[]> getProductStatistics(
            @Param("month") Integer month,
            @Param("year") Integer year
    );
}
