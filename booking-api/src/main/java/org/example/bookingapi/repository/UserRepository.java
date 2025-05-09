package org.example.bookingapi.repository;

import org.example.bookingapi.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserInfo, Integer> {
    UserInfo findByUserNum(String user_num);
    UserInfo findByUserName(String user_name);
    UserInfo findByUserEmail(String user_email);
    boolean existsByUserNum(String userNum);
} 