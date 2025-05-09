package org.example.bookingapi.controller;

import org.example.bookingapi.entity.UserAddress;
import org.example.bookingapi.service.UserAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/address")
public class UserAddressController {

    @Autowired
    private UserAddressService userAddressService;
    
    @GetMapping("/list")
    public Object getAddressList(@RequestParam String userNum) {
        try {
            List<UserAddress> addresses = userAddressService.getAddressList(userNum);
            return new Result(200, "获取地址列表成功", addresses);
        } catch (Exception e) {
            return new Result(500, "获取地址列表失败: " + e.getMessage(), null);
        }
    }
    
    @GetMapping("/default")
    public Object getDefaultAddress(@RequestParam String userNum) {
        try {
            UserAddress address = userAddressService.getDefaultAddress(userNum);
            if (address == null) {
                return new Result(404, "未设置默认地址", null);
            }
            return new Result(200, "获取默认地址成功", address);
        } catch (Exception e) {
            return new Result(500, "获取默认地址失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/add")
    public Object addAddress(@RequestBody UserAddress address) {
        try {
            UserAddress newAddress = userAddressService.addAddress(address);
            return new Result(200, "添加地址成功", newAddress);
        } catch (Exception e) {
            return new Result(500, "添加地址失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/update")
    public Object updateAddress(@RequestBody UserAddress address) {
        try {
            UserAddress updatedAddress = userAddressService.updateAddress(address);
            return new Result(200, "更新地址成功", updatedAddress);
        } catch (Exception e) {
            return new Result(500, "更新地址失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/delete")
    public Object deleteAddress(@RequestParam Long id) {
        try {
            userAddressService.deleteAddress(id);
            return new Result(200, "删除地址成功", null);
        } catch (Exception e) {
            return new Result(500, "删除地址失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/set-default")
    public Object setDefaultAddress(@RequestParam Long id, @RequestParam String userNum) {
        try {
            UserAddress defaultAddress = userAddressService.setDefaultAddress(id, userNum);
            return new Result(200, "设置默认地址成功", defaultAddress);
        } catch (Exception e) {
            return new Result(500, "设置默认地址失败: " + e.getMessage(), null);
        }
    }
    
    // 复用Result类
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