package org.example.bookingapi.repository;

import org.example.bookingapi.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    
    // 根据用户账号查询地址列表
    List<UserAddress> findByUserNum(String userNum);
    
    // 查询用户的默认地址
    UserAddress findByUserNumAndIsDefaultTrue(String userNum);
    
    // 将用户的所有地址设置为非默认
    @Modifying
    @Query("UPDATE UserAddress a SET a.isDefault = false WHERE a.userNum = :userNum")
    void resetDefaultAddresses(@Param("userNum") String userNum);
} 