package org.example.bookingapi.controller;

import org.example.bookingapi.entity.UserAsset;
import org.example.bookingapi.service.UserAssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/asset")
public class UserAssetController {

    @Autowired
    private UserAssetService userAssetService;
    
    @GetMapping("/summary")
    public Object getAssetSummary(@RequestParam String userNum) {
        try {
            Map<String, Object> summary = userAssetService.getUserAssetSummary(userNum);
            return new Result(200, "获取资产摘要成功", summary);
        } catch (Exception e) {
            return new Result(500, "获取资产摘要失败: " + e.getMessage(), null);
        }
    }
    
    @GetMapping("/points")
    public Object getPoints(@RequestParam String userNum) {
        try {
            List<UserAsset> points = userAssetService.getUserPoints(userNum);
            return new Result(200, "获取积分记录成功", points);
        } catch (Exception e) {
            return new Result(500, "获取积分记录失败: " + e.getMessage(), null);
        }
    }
    
    @GetMapping("/coupons")
    public Object getCoupons(@RequestParam String userNum) {
        try {
            List<UserAsset> coupons = userAssetService.getUserCoupons(userNum);
            return new Result(200, "获取优惠券列表成功", coupons);
        } catch (Exception e) {
            return new Result(500, "获取优惠券列表失败: " + e.getMessage(), null);
        }
    }
    
    @GetMapping("/collections")
    public Object getCollections(@RequestParam String userNum) {
        try {
            List<UserAsset> collections = userAssetService.getUserCollections(userNum);
            return new Result(200, "获取收藏列表成功", collections);
        } catch (Exception e) {
            return new Result(500, "获取收藏列表失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/points/add")
    public Object addPoints(@RequestParam String userNum, 
                           @RequestParam Integer points,
                           @RequestParam String title,
                           @RequestParam(required = false) String description) {
        try {
            UserAsset pointAsset = userAssetService.addPoints(userNum, points, title, description);
            return new Result(200, "添加积分成功", pointAsset);
        } catch (Exception e) {
            return new Result(500, "添加积分失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/points/use")
    public Object usePoints(@RequestParam String userNum, 
                           @RequestParam Integer points,
                           @RequestParam String title,
                           @RequestParam(required = false) String description) {
        try {
            boolean success = userAssetService.usePoints(userNum, points, title, description);
            if (success) {
                return new Result(200, "使用积分成功", null);
            } else {
                return new Result(400, "积分不足", null);
            }
        } catch (Exception e) {
            return new Result(500, "使用积分失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/coupon/add")
    public Object addCoupon(@RequestBody UserAsset coupon) {
        try {
            UserAsset newCoupon = userAssetService.addCoupon(coupon);
            return new Result(200, "添加优惠券成功", newCoupon);
        } catch (Exception e) {
            return new Result(500, "添加优惠券失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/coupon/use")
    public Object useCoupon(@RequestParam Long couponId) {
        try {
            boolean success = userAssetService.useCoupon(couponId);
            if (success) {
                return new Result(200, "使用优惠券成功", null);
            } else {
                return new Result(400, "优惠券不可用", null);
            }
        } catch (Exception e) {
            return new Result(500, "使用优惠券失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/collection/add")
    public Object addCollection(@RequestParam String userNum,
                               @RequestParam String collectionUrl,
                               @RequestParam String title,
                               @RequestParam(required = false) String description) {
        try {
            UserAsset collection = userAssetService.addCollection(userNum, collectionUrl, title, description);
            return new Result(200, "添加收藏成功", collection);
        } catch (Exception e) {
            return new Result(500, "添加收藏失败: " + e.getMessage(), null);
        }
    }
    
    @PostMapping("/collection/delete")
    public Object deleteCollection(@RequestParam Long id) {
        try {
            userAssetService.deleteCollection(id);
            return new Result(200, "删除收藏成功", null);
        } catch (Exception e) {
            return new Result(500, "删除收藏失败: " + e.getMessage(), null);
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