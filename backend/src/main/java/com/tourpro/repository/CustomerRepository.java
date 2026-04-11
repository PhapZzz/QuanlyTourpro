package com.tourpro.repository;

import com.tourpro.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCode(String code);
    Optional<Customer> findByPhone(String phone);
    Page<Customer> findByFullNameContainingIgnoreCaseOrPhoneContaining(String name, String phone, Pageable pageable);
    Page<Customer> findBySegment(Customer.CustomerSegment segment, Pageable pageable);
    Optional<Customer> findByUserId(Long userId);
    @Query("SELECT c FROM Customer c ORDER BY (SELECT COALESCE(SUM(b.totalPrice),0) FROM Booking b WHERE b.customer=c AND b.status IN ('PAID','COMPLETED')) DESC")
    Page<Customer> findTopByTotalSpending(Pageable pageable);
}
