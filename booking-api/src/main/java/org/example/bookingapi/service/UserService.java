package org.example.bookingapi.service;

import org.example.bookingapi.entity.UserInfo;

public interface UserService {
    UserInfo register(UserInfo userInfo);
    UserInfo login(String userName, String password);
    boolean isUserNameExist(String userName);
    boolean isUserNumExist(String userNum);
    UserInfo getUserByUserNum(String userNum);
}
