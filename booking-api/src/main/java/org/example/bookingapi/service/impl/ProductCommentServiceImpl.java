package org.example.bookingapi.service.impl;

import org.example.bookingapi.entity.ProductComment;
import org.example.bookingapi.entity.UserInfo;
import org.example.bookingapi.repository.ProductCommentRepository;
import org.example.bookingapi.repository.UserRepository;
import org.example.bookingapi.service.ProductCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductCommentServiceImpl implements ProductCommentService {

    @Autowired
    private ProductCommentRepository commentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public Page<ProductComment> getCommentsByProduct(String productNum, Pageable pageable) {
        Page<ProductComment> comments = commentRepository.findByProductNumAndStatus(
                productNum, ProductComment.CommentStatus.VISIBLE, pageable);
        
        // 填充用户信息（用于获取头像）
        return enrichCommentsWithUserInfo(comments);
    }
    
    @Override
    public Page<ProductComment> getCommentsByUser(String userNum, Pageable pageable) {
        return commentRepository.findByUserNumAndStatus(
                userNum, ProductComment.CommentStatus.VISIBLE, pageable);
    }
    
    @Override
    public ProductComment getCommentById(Integer commentId) {
        Optional<ProductComment> commentOpt = commentRepository.findById(commentId);
        if (commentOpt.isPresent()) {
            ProductComment comment = commentOpt.get();
            // 如果不是匿名评论，填充用户信息
            if (!Boolean.TRUE.equals(comment.getIsAnonymous())) {
                enrichSingleCommentWithUserInfo(comment);
            }
            return comment;
        }
        return null;
    }
    
    @Override
    @Transactional
    public ProductComment createComment(ProductComment comment) {
        // 设置默认值
        if (comment.getStatus() == null) {
            comment.setStatus(ProductComment.CommentStatus.VISIBLE);
        }
        if (comment.getIsAnonymous() == null) {
            comment.setIsAnonymous(false);
        }
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        
        return commentRepository.save(comment);
    }
    
    @Override
    @Transactional
    public ProductComment updateComment(Integer commentId, ProductComment comment) {
        Optional<ProductComment> existingCommentOpt = commentRepository.findById(commentId);
        if (existingCommentOpt.isPresent()) {
            ProductComment existingComment = existingCommentOpt.get();
            
            // 只能更新评论内容、评论图片和匿名状态
            if (comment.getCommentText() != null) {
                existingComment.setCommentText(comment.getCommentText());
            }
            if (comment.getCommentImages() != null) {
                existingComment.setCommentImages(comment.getCommentImages());
            }
            if (comment.getIsAnonymous() != null) {
                existingComment.setIsAnonymous(comment.getIsAnonymous());
            }
            
            existingComment.setUpdatedAt(LocalDateTime.now());
            
            return commentRepository.save(existingComment);
        }
        return null;
    }
    
    @Override
    @Transactional
    public boolean deleteComment(Integer commentId) {
        Optional<ProductComment> commentOpt = commentRepository.findById(commentId);
        if (commentOpt.isPresent()) {
            ProductComment comment = commentOpt.get();
            comment.setStatus(ProductComment.CommentStatus.DELETED);
            comment.setUpdatedAt(LocalDateTime.now());
            commentRepository.save(comment);
            return true;
        }
        return false;
    }
    
    @Override
    @Transactional
    public ProductComment replyComment(Integer commentId, String replyText) {
        Optional<ProductComment> commentOpt = commentRepository.findById(commentId);
        if (commentOpt.isPresent()) {
            ProductComment comment = commentOpt.get();
            comment.setReplyText(replyText);
            comment.setReplyTime(LocalDateTime.now());
            comment.setUpdatedAt(LocalDateTime.now());
            return commentRepository.save(comment);
        }
        return null;
    }
    
    @Override
    public Map<String, Object> getCommentStatisticsByProduct(String productNum) {
        Map<String, Object> statistics = new HashMap<>();
        
        // 获取评论总数
        long totalComments = commentRepository.countCommentsByProduct(
                productNum, ProductComment.CommentStatus.VISIBLE);
        statistics.put("totalComments", totalComments);
        
        // 获取平均评分
        Double averageRating = commentRepository.getAverageRatingByProduct(
                productNum, ProductComment.CommentStatus.VISIBLE);
        statistics.put("averageRating", averageRating != null ? averageRating : 0);
        
        // 获取各评分等级的数量
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            long count = commentRepository.countCommentsByProductAndRating(
                    productNum, i, ProductComment.CommentStatus.VISIBLE);
            ratingDistribution.put(i, count);
        }
        statistics.put("ratingDistribution", ratingDistribution);
        
        return statistics;
    }
    
    @Override
    public boolean hasCommentedForOrder(String orderId) {
        return commentRepository.findByOrderId(orderId).isPresent();
    }
    
    @Override
    public ProductComment getCommentByOrderId(String orderId) {
        Optional<ProductComment> commentOpt = commentRepository.findByOrderId(orderId);
        if (commentOpt.isPresent()) {
            ProductComment comment = commentOpt.get();
            // 如果不是匿名评论，填充用户信息
            if (!Boolean.TRUE.equals(comment.getIsAnonymous())) {
                enrichSingleCommentWithUserInfo(comment);
            }
            return comment;
        }
        return null;
    }
    
    // 辅助方法：填充评论用户信息
    private Page<ProductComment> enrichCommentsWithUserInfo(Page<ProductComment> comments) {
        List<ProductComment> enrichedComments = comments.getContent().stream()
                .map(comment -> {
                    // 只为非匿名评论填充用户信息
                    if (!Boolean.TRUE.equals(comment.getIsAnonymous())) {
                        enrichSingleCommentWithUserInfo(comment);
                    }
                    return comment;
                })
                .collect(Collectors.toList());
        
        return new PageImpl<>(enrichedComments, comments.getPageable(), comments.getTotalElements());
    }
    
    private void enrichSingleCommentWithUserInfo(ProductComment comment) {
        String userNum = comment.getUserNum();
        if (userNum != null) {
            Optional<UserInfo> userInfoOpt = userRepository.findByUserNum(userNum);
            if (userInfoOpt.isPresent()) {
                comment.setUserInfo(userInfoOpt.get());
            }
        }
    }
} 