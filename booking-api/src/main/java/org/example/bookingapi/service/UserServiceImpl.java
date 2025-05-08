package org.example.bookingapi.service;

import org.example.bookingapi.entity.UserInfo;
import org.example.bookingapi.repository.UserRepository;
import org.example.bookingapi.util.MD5Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserInfo register(UserInfo userInfo) {
        // 检查用户名是否已存在
        if (userRepository.findByUserName(userInfo.getUserName()) != null) {
            return null; // 用户名已存在
        }
        // 校验邮箱格式
        if (userInfo.getUserEmail() != null && !userInfo.getUserEmail().isEmpty()) {
            if (!userInfo.getUserEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
                return null; // 邮箱格式不合法
            }
        }
        // 密码加密
        userInfo.setUserPasswd(MD5Util.md5(userInfo.getUserPasswd()));
        // 自动生成账号（userNum），与触发器逻辑一致
        if (userInfo.getUserNum() == null || userInfo.getUserNum().isEmpty()) {
            String random = java.util.UUID.randomUUID().toString().replaceAll("-", "").substring(0, 6);
            userInfo.setUserNum("dict" + random);
        }
        return userRepository.save(userInfo);
    }

    @Override
    public UserInfo login(String userNameOrEmailOrNum, String password) {
        UserInfo user = null;
        // 先按用户名查
        user = userRepository.findByUserName(userNameOrEmailOrNum);
        if (user == null) {
            // 再按邮箱查
            user = userRepository.findByUserEmail(userNameOrEmailOrNum);
        }
        if (user == null) {
            // 再按账号查
            user = userRepository.findByUserNum(userNameOrEmailOrNum);
        }
        if (user != null && user.getUserPasswd().equals(MD5Util.md5(password))) {
            return user;
        }
        return null;
    }

    @Override
    public boolean isUserNameExist(String userName) {
        return userRepository.findByUserName(userName) != null;
    }
}
