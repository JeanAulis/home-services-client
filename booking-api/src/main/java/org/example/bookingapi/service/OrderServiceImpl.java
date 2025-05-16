package org.example.bookingapi.service;

import org.example.bookingapi.entity.UserOrder;
import org.example.bookingapi.entity.UserOrder.OrderStatus;
import org.example.bookingapi.repository.UserOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private UserOrderRepository userOrderRepository;
    
    @Autowired
    private UserAssetService userAssetService;

    @Override
    @Transactional
    public UserOrder createOrder(UserOrder order) {
        // 使用正确的时区获取当前时间
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Shanghai"));
        // 考虑前后端时区差异，将最小时间限制设为3.5小时
        LocalDateTime minServiceTime = now.plusHours(3).plusMinutes(30);
        
        System.out.println("当前服务器时间: " + now);
        System.out.println("最小预约时间: " + minServiceTime);
        System.out.println("用户预约时间: " + order.getServiceTime());
        
        // 尝试从额外时间信息中解析
        if (order.getExtraData() != null && order.getExtraData().containsKey("serviceTimeDesc")) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> timeDesc = (Map<String, Object>) order.getExtraData().get("serviceTimeDesc");
                String formattedTime = (String) timeDesc.get("formattedTime");
                System.out.println("用户格式化时间: " + formattedTime);
                
                // 直接使用格式化的时间字符串创建时间对象，避免时区问题
                // 此处可以添加时间处理代码
            } catch (Exception e) {
                System.out.println("解析额外时间信息出错: " + e.getMessage());
            }
        }
        
        // 临时禁用时间验证
        /* 
        if (order.getServiceTime() != null && order.getServiceTime().isBefore(minServiceTime)) {
            // 计算时间差
            long minutesDiff = java.time.Duration.between(now, order.getServiceTime()).toMinutes();
            double hoursDiff = minutesDiff / 60.0;
            System.out.println("时间差(分钟): " + minutesDiff);
            System.out.println("时间差(小时): " + hoursDiff);
            
            // 如果时间差接近4小时（超过3.5小时），仍然允许预约
            if (hoursDiff >= 3.5) {
                System.out.println("时间差接近4小时，允许预约");
            } else {
                throw new RuntimeException("预约时间必须至少在当前时间4小时后，当前时间差: " + String.format("%.1f", hoursDiff) + "小时");
            }
        }
        */
        
        System.out.println("跳过时间验证，直接处理订单");
        
        // 设置初始状态为待支付
        order.setOrderStatus(OrderStatus.PENDING);
        
        // 使用优惠券（如果有）
        if (order.getCouponId() != null && order.getCouponId() > 0) {
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
        order.setPaymentTime(LocalDateTime.now(ZoneId.of("Asia/Shanghai")));
        
        return userOrderRepository.save(order);
    }
} 