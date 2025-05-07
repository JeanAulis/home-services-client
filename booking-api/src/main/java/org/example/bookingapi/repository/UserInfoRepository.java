package org.example.bookingapi.repository;

import org.example.bookingapi.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserInfoRepository extends JpaRepository<UserInfo, Integer> {
    UserInfo findByUserPhoneNum(String userPhoneNum);
} 