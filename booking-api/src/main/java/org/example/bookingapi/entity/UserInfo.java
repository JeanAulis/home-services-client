package org.example.bookingapi.entity;

import jakarta.persistence.Table;

import jakarta.persistence.*;

@Entity
@Table(name = "user_info")
public class UserInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    @Column(name = "user_num", nullable = false)
    private String userNum;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "user_passwd", nullable = false)
    private String userPasswd;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "other")
    private String other;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "password_migrated", nullable = false)
    private Boolean passwordMigrated = false;

    // getter 和 setter
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getUserNum() { return userNum; }
    public void setUserNum(String userNum) { this.userNum = userNum; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserPasswd() { return userPasswd; }
    public void setUserPasswd(String userPasswd) { this.userPasswd = userPasswd; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getOther() { return other; }
    public void setOther(String other) { this.other = other; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Boolean getPasswordMigrated() { return passwordMigrated; }
    public void setPasswordMigrated(Boolean passwordMigrated) { this.passwordMigrated = passwordMigrated; }
}