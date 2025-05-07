package org.example.bookingapi.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "user_info")
public class UserInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "user_phone_num", unique = true)
    private String userPhoneNum;

    @Column(name = "user_passwd")
    private String userPasswd;

    @Column(name = "user_qq_num")
    private String userQqNum;

    @Column(name = "user_wechat_num")
    private String userWechatNum;

    private String other;
} 