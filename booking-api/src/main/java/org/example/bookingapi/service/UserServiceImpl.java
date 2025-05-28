package org.example.bookingapi.service;

import org.example.bookingapi.entity.UserInfo;
import org.example.bookingapi.repository.UserRepository;
import org.example.bookingapi.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserInfo register(UserInfo userInfo) {
        // 检查用户名是否已存在
        if (userRepository.findByUserName(userInfo.getUserName()).isPresent()) {
            return null; // 用户名已存在
        }
        // 校验邮箱格式
        if (userInfo.getUserEmail() != null && !userInfo.getUserEmail().isEmpty()) {
            if (!userInfo.getUserEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
                return null; // 邮箱格式不合法
            }
        }
        // 自动生成账号（userNum），与触发器逻辑一致
        if (userInfo.getUserNum() == null || userInfo.getUserNum().isEmpty()) {
            // 生成一个不重复的userNum
            String random;
            String userNum;
            do {
                random = java.util.UUID.randomUUID().toString().replaceAll("-", "").substring(0, 6);
                userNum = "dict" + random;
            } while (isUserNumExist(userNum));
            userInfo.setUserNum(userNum);
        } else {
            // 如果用户主动提供了userNum，检查是否已存在
            if (isUserNumExist(userInfo.getUserNum())) {
                return null; // 账号已存在
            }
        }
        // 密码加密 - 使用BCrypt算法
        userInfo.setUserPasswd(PasswordUtil.encode(userInfo.getUserPasswd()));
        // 新注册用户密码已迁移
        userInfo.setPasswordMigrated(true);
        return userRepository.save(userInfo);
    }

    @Override
    public UserInfo login(String userNameOrEmailOrNum, String password) {
        UserInfo user = null;
        
        // 先按用户名查
        Optional<UserInfo> userOpt = userRepository.findByUserName(userNameOrEmailOrNum);
        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            // 再按邮箱查
            userOpt = userRepository.findByUserEmail(userNameOrEmailOrNum);
            if (userOpt.isPresent()) {
                user = userOpt.get();
            } else {
                // 再按账号查
                userOpt = userRepository.findByUserNum(userNameOrEmailOrNum);
                if (userOpt.isPresent()) {
                    user = userOpt.get();
                }
            }
        }
        
        if (user != null) {
            // 检查密码是否已迁移
            if (user.getPasswordMigrated() != null && user.getPasswordMigrated()) {
                // 已迁移，使用BCrypt验证
                if (PasswordUtil.matches(password, user.getUserPasswd())) {
                    return user;
                }
            } else {
                // 未迁移，使用MD5验证（临时兼容）
                if (user.getUserPasswd().equals(md5(password))) {
                    // 验证成功后立即迁移密码
                    user.setUserPasswd(PasswordUtil.encode(password));
                    user.setPasswordMigrated(true);
                    userRepository.save(user);
                    return user;
                }
            }
        }
        return null;
    }
    
    /**
     * MD5加密方法（仅用于密码迁移期间的兼容性）
     * @param input 输入字符串
     * @return MD5加密后的字符串
     */
    private String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : messageDigest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5算法不可用", e);
        }
    }

    @Override
    public boolean isUserNameExist(String userName) {
        return userRepository.findByUserName(userName).isPresent();
    }
    
    @Override
    public boolean isUserNumExist(String userNum) {
        return userRepository.existsByUserNum(userNum);
    }
    
    @Override
    public UserInfo getUserByUserNum(String userNum) {
        Optional<UserInfo> userOpt = userRepository.findByUserNum(userNum);
        return userOpt.orElse(null);
    }
}
