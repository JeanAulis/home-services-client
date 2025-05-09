package org.example.bookingapi.service;

import org.example.bookingapi.entity.UserAsset;
// import org.example.bookingapi.entity.UserAsset.AssetType;

import java.util.List;
import java.util.Map;

public interface UserAssetService {
    
    // 获取用户资产汇总信息
    Map<String, Object> getUserAssetSummary(String userNum);
    
    // 获取用户积分列表
    List<UserAsset> getUserPoints(String userNum);
    
    // 获取用户优惠券列表
    List<UserAsset> getUserCoupons(String userNum);
    
    // 获取用户收藏列表
    List<UserAsset> getUserCollections(String userNum);
    
    // 添加资产记录
    UserAsset addUserAsset(UserAsset userAsset);
    
    // 添加积分
    UserAsset addPoints(String userNum, Integer points, String title, String description);
    
    // 使用积分
    boolean usePoints(String userNum, Integer points, String title, String description);
    
    // 添加优惠券
    UserAsset addCoupon(UserAsset coupon);
    
    // 使用优惠券
    boolean useCoupon(Long couponId);
    
    // 添加收藏
    UserAsset addCollection(String userNum, String collectionUrl, String title, String description);
    
    // 删除收藏
    void deleteCollection(Long id);
} 