package org.example.bookingapi.controller;

import org.example.bookingapi.entity.UserInfo;
import org.example.bookingapi.service.UserInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserInfoService userInfoService;

    @PostMapping
    public ResponseEntity<UserInfo> createUser(@RequestBody UserInfo userInfo) {
        return ResponseEntity.ok(userInfoService.saveUser(userInfo));
    }

    @GetMapping("/{userPhoneNum}")
    public ResponseEntity<UserInfo> getUserByPhone(@PathVariable String userPhoneNum) {
        UserInfo user = userInfoService.findByPhoneNum(userPhoneNum);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }
} 