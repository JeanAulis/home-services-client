package org.example.bookingapi.controller;

import org.example.bookingapi.entity.UserOrder;
import org.example.bookingapi.entity.UserOrder.OrderStatus;
import org.example.bookingapi.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    @GetMapping("/list")
    public Object getOrderList(@RequestParam String userNum,
                              @RequestParam(required = false) String status) {
        try {
            List<UserOrder> orders;
            if (status != null && !status.isEmpty()) {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                orders = orderService.getUserOrdersByStatus(userNum, orderStatus);
            } else {
                orders = orderService.getUserOrders(userNum);
            }
            return new Result(200, "获取订单列表成功", orders);
        } catch (IllegalArgumentException e) {
            return new Result(400, "无效的订单状态", null);
        } catch (Exception e) {
            return new Result(500, "获取订单列表失败: " + e.getMessage(), null);
        }
    }
    
    @GetMapping("/detail")
    public Object getOrderDetail(@RequestParam String orderId) {
        try {
            UserOrder order = orderService.getOrderDetail(orderId);
            if (order == null) {
                return new Result(404, "订单不存在", null);
            }
            return new Result(200, "获取订单详情成功", order);
        } catch (Exception e) {
            return new Result(500, "获取订单详情失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/create")
    public Object createOrder(@RequestBody UserOrder order) {
        try {
            UserOrder newOrder = orderService.createOrder(order);
            return new Result(200, "创建订单成功", newOrder);
        } catch (Exception e) {
            return new Result(500, "创建订单失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/pay")
    public Object payOrder(@RequestParam String orderId, @RequestParam String paymentMethod) {
        try {
            UserOrder paidOrder = orderService.payOrder(orderId, paymentMethod);
            return new Result(200, "支付订单成功", paidOrder);
        } catch (Exception e) {
            return new Result(500, "支付订单失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/cancel")
    public Object cancelOrder(@RequestParam String orderId) {
        try {
            UserOrder cancelledOrder = orderService.cancelOrder(orderId);
            return new Result(200, "取消订单成功", cancelledOrder);
        } catch (Exception e) {
            return new Result(500, "取消订单失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/update-status")
    public Object updateOrderStatus(@RequestParam String orderId, @RequestParam String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            UserOrder updatedOrder = orderService.updateOrderStatus(orderId, orderStatus);
            return new Result(200, "更新订单状态成功", updatedOrder);
        } catch (IllegalArgumentException e) {
            return new Result(400, "无效的订单状态", null);
        } catch (Exception e) {
            return new Result(500, "更新订单状态失败: " + e.getMessage(), null);
        }
    }
    
    // 复用Result类
    static class Result {
        public int code;
        public String msg;
        public Object data;
        public Result(int code, String msg, Object data) {
            this.code = code;
            this.msg = msg;
            this.data = data;
        }
    }
} 