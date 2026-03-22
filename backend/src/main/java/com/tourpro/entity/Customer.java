package com.tourpro.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
@EntityListeners(AuditingEntityListener.class)
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Enumerated(EnumType.STRING)
    private Employee.Gender gender;

    private LocalDate dob;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String cccdPassport;

    @Column(length = 255)
    private String address;

    @Enumerated(EnumType.STRING)
    private CustomerSource source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerSegment segment;

    @Column(nullable = false)
    private Integer loyaltyPoints;

    @Column(columnDefinition = "TEXT")
    private String preferences;

    @Column(columnDefinition = "TEXT")
    private String specialRequest;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @CreatedDate private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;

    public enum CustomerSource { WEBSITE, ZALO, FACEBOOK, REFERRAL, DIRECT, OTHER }
    public enum CustomerSegment { NEW, REGULAR, LOYAL, VIP }
}
