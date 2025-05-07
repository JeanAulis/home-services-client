package org.example.bookingapi.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "`order`")
public class Order {
    @Id
    @Column(length = 12)
    private String orderId;

    @Column(nullable = false, unique = true)
    private String userPhoneNum;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType serviceType;

    @Column(nullable = false)
    private String serviceLocation;

    private LocalDateTime serviceTime;

    @Column(nullable = false)
    private String cleaner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus orderStatus = OrderStatus.未支付;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayMethod payMethod;

    private LocalDateTime timeOfOrder;

    private LocalDateTime paymentTime;

    private String other;

    public enum ServiceType {
        日常保洁,
        深度保洁,
        清洗空调内外机,
        物品收纳
    }

    public enum OrderStatus {
        未支付,
        已支付,
        待接单,
        待确认,
        服务中,
        已完成
    }

    public enum PayMethod {
        银行卡支付,
        扫码支付,
        微信支付,
        云闪付支付,
        其他支付方式
    }
} 