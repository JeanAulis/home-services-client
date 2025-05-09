package org.example.bookingapi.service;

import org.example.bookingapi.entity.UserAsset;
import org.example.bookingapi.entity.UserAsset.AssetType;
import org.example.bookingapi.repository.UserAssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserAssetServiceImpl implements UserAssetService {

    @Autowired
    private UserAssetRepository userAssetRepository;

    @Override
    public Map<String, Object> getUserAssetSummary(String userNum) {
        Map<String, Object> summary = new HashMap<>();
        
        // 获取积分总和
        Integer totalPoints = userAssetRepository.getTotalPointsByUserNum(userNum);
        summary.put("points", totalPoints != null ? totalPoints : 0);
        
        // 获取优惠券数量
        Integer couponsCount = userAssetRepository.getCouponCountByUserNum(userNum, LocalDateTime.now());
        summary.put("coupons", couponsCount != null ? couponsCount : 0);
        
        // 获取收藏数量
        Integer collectionsCount = userAssetRepository.getCollectionCountByUserNum(userNum);
        summary.put("collections", collectionsCount != null ? collectionsCount : 0);
        
        return summary;
    }

    @Override
    public List<UserAsset> getUserPoints(String userNum) {
        return userAssetRepository.findByUserNumAndAssetType(userNum, AssetType.POINT);
    }

    @Override
    public List<UserAsset> getUserCoupons(String userNum) {
        return userAssetRepository.getValidCoupons(userNum, LocalDateTime.now());
    }

    @Override
    public List<UserAsset> getUserCollections(String userNum) {
        return userAssetRepository.findByUserNumAndAssetType(userNum, AssetType.COLLECTION);
    }

    @Override
    public UserAsset addUserAsset(UserAsset userAsset) {
        return userAssetRepository.save(userAsset);
    }

    @Override
    @Transactional
    public UserAsset addPoints(String userNum, Integer points, String title, String description) {
        UserAsset pointAsset = new UserAsset();
        pointAsset.setUserNum(userNum);
        pointAsset.setAssetType(AssetType.POINT);
        pointAsset.setAssetValue(points);
        pointAsset.setTitle(title);
        pointAsset.setDescription(description);
        
        return userAssetRepository.save(pointAsset);
    }

    @Override
    @Transactional
    public boolean usePoints(String userNum, Integer points, String title, String description) {
        // 获取用户总积分
        Integer totalPoints = userAssetRepository.getTotalPointsByUserNum(userNum);
        
        if (totalPoints == null || totalPoints < points) {
            return false; // 积分不足
        }
        
        // 记录积分使用
        UserAsset pointAsset = new UserAsset();
        pointAsset.setUserNum(userNum);
        pointAsset.setAssetType(AssetType.POINT);
        pointAsset.setAssetValue(-points); // 使用积分为负值
        pointAsset.setTitle(title);
        pointAsset.setDescription(description);
        
        userAssetRepository.save(pointAsset);
        return true;
    }

    @Override
    public UserAsset addCoupon(UserAsset coupon) {
        coupon.setAssetType(AssetType.COUPON);
        return userAssetRepository.save(coupon);
    }

    @Override
    @Transactional
    public boolean useCoupon(Long couponId) {
        Optional<UserAsset> couponOpt = userAssetRepository.findById(couponId);
        
        if (couponOpt.isEmpty()) {
            return false; // 优惠券不存在
        }
        
        UserAsset coupon = couponOpt.get();
        
        // 检查是否是优惠券类型
        if (coupon.getAssetType() != AssetType.COUPON) {
            return false;
        }
        
        // 检查优惠券是否过期
        if (coupon.getValidTo() != null && coupon.getValidTo().isBefore(LocalDateTime.now())) {
            return false; // 优惠券已过期
        }
        
        // 标记优惠券为已使用（设置过期时间为当前时间）
        coupon.setValidTo(LocalDateTime.now());
        userAssetRepository.save(coupon);
        
        return true;
    }

    @Override
    public UserAsset addCollection(String userNum, String collectionUrl, String title, String description) {
        UserAsset collection = new UserAsset();
        collection.setUserNum(userNum);
        collection.setAssetType(AssetType.COLLECTION);
        collection.setCollectionUrl(collectionUrl);
        collection.setTitle(title);
        collection.setDescription(description);
        
        return userAssetRepository.save(collection);
    }

    @Override
    public void deleteCollection(Long id) {
        userAssetRepository.deleteById(id);
    }
} 