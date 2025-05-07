package org.example.bookingapi.controller;

import org.example.bookingapi.entity.Order;
import org.example.bookingapi.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.ok(orderService.saveOrder(order));
    }

    @GetMapping("/user/{phoneNum}")
    public ResponseEntity<List<Order>> getOrdersByUserPhone(@PathVariable String phoneNum) {
        return ResponseEntity.ok(orderService.findByUserPhoneNum(phoneNum));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable String orderId) {
        Order order = orderService.findByOrderId(orderId);
        return order != null ? ResponseEntity.ok(order) : ResponseEntity.notFound().build();
    }
} 