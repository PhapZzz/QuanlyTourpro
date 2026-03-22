package com.tourpro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class TourProApplication {
    public static void main(String[] args) {
        SpringApplication.run(TourProApplication.class, args);
    }

}
