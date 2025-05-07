package org.example.bookingapi.service;

import org.example.bookingapi.entity.Order;
import org.example.bookingapi.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    public List<Order> findByUserPhoneNum(String phoneNum) {
        return orderRepository.findByUserPhoneNum(phoneNum);
    }

    public Order findByOrderId(String orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }
} 