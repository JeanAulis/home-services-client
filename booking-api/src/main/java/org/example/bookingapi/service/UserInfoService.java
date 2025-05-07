package org.example.bookingapi.service;

import org.example.bookingapi.entity.UserInfo;
import org.example.bookingapi.repository.UserInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserInfoService {
    @Autowired
    private UserInfoRepository userInfoRepository;

    public UserInfo saveUser(UserInfo userInfo) {
        return userInfoRepository.save(userInfo);
    }

    public UserInfo findByPhoneNum(String userPhoneNum) {
        return userInfoRepository.findByUserPhoneNum(userPhoneNum);
    }
} 