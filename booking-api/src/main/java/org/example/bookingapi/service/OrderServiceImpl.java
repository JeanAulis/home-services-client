package org.example.bookingapi.service;

import org.example.bookingapi.entity.UserOrder;
import org.example.bookingapi.entity.UserOrder.OrderStatus;
import org.example.bookingapi.repository.UserOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private UserOrderRepository userOrderRepository;
    
    @Autowired
    private UserAssetService userAssetService;

    @Override
    @Transactional
    public UserOrder createOrder(UserOrder order) {
        // 设置初始状态为待支付
        order.setOrderStatus(OrderStatus.PENDING);
        
        // 使用优惠券（如果有）
        if (order.getCouponId() != null) {
            boolean usedCoupon = userAssetService.useCoupon(order.getCouponId());
            if (!usedCoupon) {
                throw new RuntimeException("优惠券使用失败，可能已过期或不存在");
            }
        }
        
        return userOrderRepository.save(order);
    }

    @Override
    public List<UserOrder> getUserOrders(String userNum) {
        return userOrderRepository.findByUserNumOrderByCreatedAtDesc(userNum);
    }

    @Override
    public List<UserOrder> getUserOrdersByStatus(String userNum, OrderStatus status) {
        return userOrderRepository.findByUserNumAndOrderStatusOrderByCreatedAtDesc(userNum, status);
    }

    @Override
    public UserOrder getOrderDetail(String orderId) {
        return userOrderRepository.findByOrderId(orderId);
    }

    @Override
    @Transactional
    public UserOrder updateOrderStatus(String orderId, OrderStatus status) {
        UserOrder order = userOrderRepository.findByOrderId(orderId);
        
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        
        order.setOrderStatus(status);
        
        // 如果状态变为已完成，添加积分奖励
        if (status == OrderStatus.COMPLETED) {
            // 奖励积分为订单金额的10%，向下取整
            int rewardPoints = order.getOrderAmount().intValue() / 10;
            if (rewardPoints > 0) {
                userAssetService.addPoints(
                    order.getUserNum(), 
                    rewardPoints, 
                    "订单完成奖励", 
                    "订单号：" + order.getOrderId()
                );
            }
        }
        
        return userOrderRepository.save(order);
    }

    @Override
    @Transactional
    public UserOrder cancelOrder(String orderId) {
        UserOrder order = userOrderRepository.findByOrderId(orderId);
        
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        
        // 只有待支付和已支付状态的订单可以取消
        if (order.getOrderStatus() != OrderStatus.PENDING && order.getOrderStatus() != OrderStatus.PAID) {
            throw new RuntimeException("当前订单状态不可取消");
        }
        
        order.setOrderStatus(OrderStatus.CANCELLED);
        
        // 如果使用了优惠券，需要返还（这里简化处理，实际可能需要创建新的优惠券）
        // 此处省略...
        
        return userOrderRepository.save(order);
    }

    @Override
    @Transactional
    public UserOrder payOrder(String orderId, String paymentMethod) {
        UserOrder order = userOrderRepository.findByOrderId(orderId);
        
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        
        // 只有待支付状态的订单可以支付
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("当前订单状态不可支付");
        }
        
        order.setOrderStatus(OrderStatus.PAID);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentTime(LocalDateTime.now());
        
        return userOrderRepository.save(order);
    }
} 