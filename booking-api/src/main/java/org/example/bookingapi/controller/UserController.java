package org.example.bookingapi.controller;

import org.example.bookingapi.entity.UserInfo;
import org.example.bookingapi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public Object register(@RequestBody UserInfo userInfo) {
        int code = 200;
        String msg = "注册成功";
        UserInfo user = null;
        // 检查用户名是否已存在
        if (userService.register(userInfo) == null) {
            // 判断是用户名已存在还是邮箱格式不合法
            if (userService.isUserNameExist(userInfo.getUserName())) {
                code = 400;
                msg = "用户名已存在";
            } else if (userInfo.getUserEmail() != null && !userInfo.getUserEmail().isEmpty() && !userInfo.getUserEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
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
        return new Result(200, "登录成功", user);
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