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

    @Column(name = "user_phone_num")
    private String userPhoneNum;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type")
    private ServiceType serviceType;

    @Column(name = "service_location")
    private String serviceLocation;

    @Column(name = "service_time")
    private LocalDateTime serviceTime;

    private String Cleaner;

    @Enumerated(EnumType.STRING)
    @Column(name = "order status")
    private OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "pay_method")
    private PayMethod payMethod;

    private String other;

    public enum ServiceType {
        日常保洁, 深度保洁, 清洗空调内外机, 物品收纳
    }

    public enum OrderStatus {
        未支付, 已支付, 待接单, 待确认, 服务中, 已完成
    }

    public enum PayMethod {
        银行卡支付, 扫码支付, 微信支付, 云闪付支付, 其他支付方式
    }
} 