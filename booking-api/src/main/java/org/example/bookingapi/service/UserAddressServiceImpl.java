package org.example.bookingapi.service;

import org.example.bookingapi.entity.UserAddress;
import org.example.bookingapi.repository.UserAddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserAddressServiceImpl implements UserAddressService {

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Override
    public List<UserAddress> getAddressList(String userNum) {
        return userAddressRepository.findByUserNum(userNum);
    }

    @Override
    public UserAddress getDefaultAddress(String userNum) {
        return userAddressRepository.findByUserNumAndIsDefaultTrue(userNum);
    }

    @Override
    @Transactional
    public UserAddress addAddress(UserAddress address) {
        // 如果是设为默认地址，先将其他地址设为非默认
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            userAddressRepository.resetDefaultAddresses(address.getUserNum());
        }
        // 如果是第一个地址，自动设为默认地址
        else if (userAddressRepository.findByUserNum(address.getUserNum()).isEmpty()) {
            address.setIsDefault(true);
        }
        return userAddressRepository.save(address);
    }

    @Override
    @Transactional
    public UserAddress updateAddress(UserAddress address) {
        Optional<UserAddress> existingAddress = userAddressRepository.findById(address.getId());
        
        if (existingAddress.isEmpty()) {
            throw new RuntimeException("地址不存在");
        }
        
        // 如果是设为默认地址，先将其他地址设为非默认
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            userAddressRepository.resetDefaultAddresses(address.getUserNum());
        }
        
        return userAddressRepository.save(address);
    }

    @Override
    @Transactional
    public void deleteAddress(Long id) {
        Optional<UserAddress> address = userAddressRepository.findById(id);
        
        if (address.isEmpty()) {
            throw new RuntimeException("地址不存在");
        }
        
        userAddressRepository.deleteById(id);
        
        // 如果删除的是默认地址，且还有其他地址，则将第一个地址设为默认地址
        if (Boolean.TRUE.equals(address.get().getIsDefault())) {
            List<UserAddress> addresses = userAddressRepository.findByUserNum(address.get().getUserNum());
            if (!addresses.isEmpty()) {
                UserAddress firstAddress = addresses.get(0);
                firstAddress.setIsDefault(true);
                userAddressRepository.save(firstAddress);
            }
        }
    }

    @Override
    @Transactional
    public UserAddress setDefaultAddress(Long id, String userNum) {
        // 先重置所有地址为非默认
        userAddressRepository.resetDefaultAddresses(userNum);
        
        // 设置指定地址为默认
        Optional<UserAddress> address = userAddressRepository.findById(id);
        if (address.isEmpty()) {
            throw new RuntimeException("地址不存在");
        }
        
        UserAddress defaultAddress = address.get();
        defaultAddress.setIsDefault(true);
        return userAddressRepository.save(defaultAddress);
    }
} 