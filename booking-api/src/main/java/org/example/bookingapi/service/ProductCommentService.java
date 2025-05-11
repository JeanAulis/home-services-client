package org.example.bookingapi.service;

import org.example.bookingapi.entity.ProductComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface ProductCommentService {
    
    // 获取商品评论（分页）
    Page<ProductComment> getCommentsByProduct(String productNum, Pageable pageable);
    
    // 获取用户评论（分页）
    Page<ProductComment> getCommentsByUser(String userNum, Pageable pageable);
    
    // 获取评论详情
    ProductComment getCommentById(Integer commentId);
    
    // 创建评论
    ProductComment createComment(ProductComment comment);
    
    // 更新评论
    ProductComment updateComment(Integer commentId, ProductComment comment);
    
    // 删除评论
    boolean deleteComment(Integer commentId);
    
    // 回复评论
    ProductComment replyComment(Integer commentId, String replyText);
    
    // 获取评论统计信息
    Map<String, Object> getCommentStatisticsByProduct(String productNum);
    
    // 检查用户是否已对订单评论
    boolean hasCommentedForOrder(String orderId);
    
    // 按订单ID获取评论
    ProductComment getCommentByOrderId(String orderId);
} 