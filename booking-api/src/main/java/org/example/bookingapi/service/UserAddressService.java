package org.example.bookingapi.service;

import org.example.bookingapi.entity.UserAddress;
import java.util.List;

public interface UserAddressService {
    
    // 获取用户地址列表
    List<UserAddress> getAddressList(String userNum);
    
    // 获取用户默认地址
    UserAddress getDefaultAddress(String userNum);
    
    // 获取单个地址详情
    UserAddress getAddressById(Long id, String userNum);
    
    // 添加新地址
    UserAddress addAddress(UserAddress address);
    
    // 更新地址
    UserAddress updateAddress(UserAddress address);
    
    // 删除地址
    void deleteAddress(Long id);
    
    // 设置默认地址
    UserAddress setDefaultAddress(Long id, String userNum);
} 