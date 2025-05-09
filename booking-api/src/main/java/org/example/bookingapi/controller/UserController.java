package org.example.bookingapi.controller;

import org.example.bookingapi.entity.UserInfo;
import org.example.bookingapi.service.UserAssetService;
import org.example.bookingapi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserAssetService userAssetService;

    @PostMapping("/register")
    public Object register(@RequestBody UserInfo userInfo) {
        int code = 200;
        String msg = "注册成功";
        UserInfo user = null;
        // 检查用户名是否已存在
        if (userService.register(userInfo) == null) {
            // 判断是用户名已存在还是邮箱格式不合法或账号已存在
            if (userService.isUserNameExist(userInfo.getUserName())) {
                code = 400;
                msg = "用户名已存在";
            } else if (userInfo.getUserNum() != null && !userInfo.getUserNum().isEmpty() 
                    && userService.isUserNumExist(userInfo.getUserNum())) {
                code = 402;
                msg = "账号已存在";
            } else if (userInfo.getUserEmail() != null && !userInfo.getUserEmail().isEmpty() 
                    && !userInfo.getUserEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
                code = 401;
                msg = "邮箱格式不合法";
            } else {
                code = 500;
                msg = "注册失败";
            }
            return new Result(code, msg, null);
        }
        user = userService.register(userInfo);
        return new Result(200, "注册成功", user);
    }

    @PostMapping("/login")
    public Object login(@RequestBody UserInfo userInfo) {
        // 允许用户名、邮箱、账号三种方式登录
        String loginKey = userInfo.getUserName();
        if (loginKey == null || loginKey.isEmpty()) {
            loginKey = userInfo.getUserEmail();
        }
        if (loginKey == null || loginKey.isEmpty()) {
            loginKey = userInfo.getUserNum();
        }
        UserInfo user = userService.login(loginKey, userInfo.getUserPasswd());
        if (user == null) {
            return new Result(401, "用户名/邮箱/账号或密码错误", null);
        }
        
        // 获取用户资产摘要信息，并添加到用户信息中
        try {
            Map<String, Object> assetSummary = userAssetService.getUserAssetSummary(user.getUserNum());
            return new Result(200, "登录成功", new UserInfoWithAssets(user, assetSummary));
        } catch (Exception e) {
            return new Result(200, "登录成功", user);
        }
    }
    
    @GetMapping("/info")
    public Object getUserInfo(@RequestParam String userNum) {
        try {
            UserInfo user = userService.getUserByUserNum(userNum);
            if (user == null) {
                return new Result(404, "用户不存在", null);
            }
            
            // 获取用户资产摘要信息
            Map<String, Object> assetSummary = userAssetService.getUserAssetSummary(userNum);
            return new Result(200, "获取用户信息成功", new UserInfoWithAssets(user, assetSummary));
        } catch (Exception e) {
            return new Result(500, "获取用户信息失败: " + e.getMessage(), null);
        }
    }
    
    // 静态内部类，将用户信息和资产摘要信息合并
    static class UserInfoWithAssets {
        public UserInfo userInfo;
        public Map<String, Object> assets;
        
        public UserInfoWithAssets(UserInfo userInfo, Map<String, Object> assets) {
            this.userInfo = userInfo;
            this.assets = assets;
        }
    }

    static class Result {
        public int code;
        public String msg;
        public Object data;
        public Result(int code, String msg, Object data) {
            this.code = code;
            this.msg = msg;
            this.data = data;
        }
    }
} 