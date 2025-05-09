package org.example.bookingapi.service;

import org.example.bookingapi.entity.UserOrder;
import org.example.bookingapi.entity.UserOrder.OrderStatus;

import java.util.List;

public interface OrderService {
    
    // 创建订单
    UserOrder createOrder(UserOrder order);
    
    // 获取用户订单列表
    List<UserOrder> getUserOrders(String userNum);
    
    // 根据状态获取用户订单列表
    List<UserOrder> getUserOrdersByStatus(String userNum, OrderStatus status);
    
    // 获取订单详情
    UserOrder getOrderDetail(String orderId);
    
    // 更新订单状态
    UserOrder updateOrderStatus(String orderId, OrderStatus status);
    
    // 取消订单
    UserOrder cancelOrder(String orderId);
    
    // 支付订单
    UserOrder payOrder(String orderId, String paymentMethod);
} 