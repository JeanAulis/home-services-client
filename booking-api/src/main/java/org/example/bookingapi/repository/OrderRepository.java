package org.example.bookingapi.repository;

import org.example.bookingapi.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUserPhoneNum(String userPhoneNum);
} 