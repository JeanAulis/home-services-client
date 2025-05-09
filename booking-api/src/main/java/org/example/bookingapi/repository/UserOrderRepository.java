package org.example.bookingapi.repository;

import org.example.bookingapi.entity.UserOrder;
import org.example.bookingapi.entity.UserOrder.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserOrderRepository extends JpaRepository<UserOrder, String> {
    
    // 根据用户账号查询订单列表
    List<UserOrder> findByUserNumOrderByCreatedAtDesc(String userNum);
    
    // 根据用户账号和订单状态查询
    List<UserOrder> findByUserNumAndOrderStatusOrderByCreatedAtDesc(String userNum, OrderStatus orderStatus);
    
    // 根据订单ID查询订单
    UserOrder findByOrderId(String orderId);
} 