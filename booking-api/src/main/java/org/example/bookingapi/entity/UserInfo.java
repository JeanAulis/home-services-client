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

    private String userName;

    private String userEmail;

    @Column(nullable = false, unique = true)
    private String userPhoneNum;

    @Column(nullable = false)
    private String userPasswd;

    private String userQqNum;

    private String userWechatNum;

    private String other;
} 