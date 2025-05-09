package org.example.bookingapi.repository;

import org.example.bookingapi.entity.UserAsset;
import org.example.bookingapi.entity.UserAsset.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface UserAssetRepository extends JpaRepository<UserAsset, Long> {
    
    // 根据用户账号和资产类型查询
    List<UserAsset> findByUserNumAndAssetType(String userNum, AssetType assetType);
    
    // 查询用户积分总和
    @Query("SELECT SUM(a.assetValue) FROM UserAsset a WHERE a.userNum = :userNum AND a.assetType = 'POINT'")
    Integer getTotalPointsByUserNum(@Param("userNum") String userNum);
    
    // 查询用户优惠券数量
    @Query("SELECT COUNT(a) FROM UserAsset a WHERE a.userNum = :userNum AND a.assetType = 'COUPON' AND (a.validTo IS NULL OR a.validTo > :now)")
    Integer getCouponCountByUserNum(@Param("userNum") String userNum, @Param("now") LocalDateTime now);
    
    // 查询用户收藏数量
    @Query("SELECT COUNT(a) FROM UserAsset a WHERE a.userNum = :userNum AND a.assetType = 'COLLECTION'")
    Integer getCollectionCountByUserNum(@Param("userNum") String userNum);
    
    // 查询有效的优惠券
    @Query("SELECT a FROM UserAsset a WHERE a.userNum = :userNum AND a.assetType = 'COUPON' AND (a.validTo IS NULL OR a.validTo > :now)")
    List<UserAsset> getValidCoupons(@Param("userNum") String userNum, @Param("now") LocalDateTime now);
} 