package org.example.bookingapi.controller;

import org.example.bookingapi.entity.ProductComment;
import org.example.bookingapi.service.ProductCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/comment")
public class ProductCommentController {

    @Autowired
    private ProductCommentService commentService;

    // 获取商品评论
    @GetMapping("/product")
    public Object getCommentsByProduct(
            @RequestParam String productNum,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {
        
        try {
            // 创建分页和排序
            Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
            Sort sort = Sort.by(direction, sortBy);
            Pageable pageable = PageRequest.of(page - 1, size, sort);
            
            Page<ProductComment> comments = commentService.getCommentsByProduct(productNum, pageable);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("comments", comments.getContent());
            responseData.put("currentPage", comments.getNumber() + 1);
            responseData.put("totalItems", comments.getTotalElements());
            responseData.put("totalPages", comments.getTotalPages());
            
            // 获取评论统计信息
            Map<String, Object> statistics = commentService.getCommentStatisticsByProduct(productNum);
            responseData.put("statistics", statistics);
            
            return new Result(200, "获取商品评论成功", responseData);
        } catch (Exception e) {
            return new Result(500, "获取商品评论失败: " + e.getMessage(), null);
        }
    }
    
    // 获取用户评论
    @GetMapping("/user")
    public Object getCommentsByUser(
            @RequestParam String userNum,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<ProductComment> comments = commentService.getCommentsByUser(userNum, pageable);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("comments", comments.getContent());
            responseData.put("currentPage", comments.getNumber() + 1);
            responseData.put("totalItems", comments.getTotalElements());
            responseData.put("totalPages", comments.getTotalPages());
            
            return new Result(200, "获取用户评论成功", responseData);
        } catch (Exception e) {
            return new Result(500, "获取用户评论失败: " + e.getMessage(), null);
        }
    }
    
    // 获取评论详情
    @GetMapping("/detail")
    public Object getCommentDetail(@RequestParam Integer commentId) {
        try {
            ProductComment comment = commentService.getCommentById(commentId);
            if (comment == null) {
                return new Result(404, "评论不存在", null);
            }
            return new Result(200, "获取评论详情成功", comment);
        } catch (Exception e) {
            return new Result(500, "获取评论详情失败: " + e.getMessage(), null);
        }
    }
    
    // 添加评论
    @PostMapping("/create")
    public Object createComment(@RequestBody ProductComment comment) {
        try {
            // 检查是否已经评论过该订单
            if (comment.getOrderId() != null && commentService.hasCommentedForOrder(comment.getOrderId())) {
                return new Result(400, "您已经评论过该订单", null);
            }
            
            ProductComment createdComment = commentService.createComment(comment);
            return new Result(200, "评论成功", createdComment);
        } catch (Exception e) {
            return new Result(500, "评论失败: " + e.getMessage(), null);
        }
    }
    
    // 更新评论
    @PutMapping("/update")
    public Object updateComment(
            @RequestParam Integer commentId,
            @RequestBody ProductComment comment) {
        
        try {
            ProductComment updatedComment = commentService.updateComment(commentId, comment);
            if (updatedComment == null) {
                return new Result(404, "评论不存在", null);
            }
            return new Result(200, "更新评论成功", updatedComment);
        } catch (Exception e) {
            return new Result(500, "更新评论失败: " + e.getMessage(), null);
        }
    }
    
    // 删除评论
    @DeleteMapping("/delete")
    public Object deleteComment(@RequestParam Integer commentId) {
        try {
            boolean success = commentService.deleteComment(commentId);
            if (!success) {
                return new Result(404, "评论不存在", null);
            }
            return new Result(200, "删除评论成功", null);
        } catch (Exception e) {
            return new Result(500, "删除评论失败: " + e.getMessage(), null);
        }
    }
    
    // 回复评论（管理员接口）
    @PostMapping("/reply")
    public Object replyComment(
            @RequestParam Integer commentId,
            @RequestParam String replyText) {
        
        try {
            ProductComment comment = commentService.replyComment(commentId, replyText);
            if (comment == null) {
                return new Result(404, "评论不存在", null);
            }
            return new Result(200, "回复评论成功", comment);
        } catch (Exception e) {
            return new Result(500, "回复评论失败: " + e.getMessage(), null);
        }
    }
    
    // 获取订单评论
    @GetMapping("/order")
    public Object getCommentByOrder(@RequestParam String orderId) {
        try {
            ProductComment comment = commentService.getCommentByOrderId(orderId);
            if (comment == null) {
                return new Result(404, "该订单暂无评论", null);
            }
            return new Result(200, "获取订单评论成功", comment);
        } catch (Exception e) {
            return new Result(500, "获取订单评论失败: " + e.getMessage(), null);
        }
    }
    
    // 结果包装类
    static class Result {
        private int code;
        private String msg;
        private Object data;
        
        public Result(int code, String msg, Object data) {
            this.code = code;
            this.msg = msg;
            this.data = data;
        }
        
        public int getCode() {
            return code;
        }
        
        public void setCode(int code) {
            this.code = code;
        }
        
        public String getMsg() {
            return msg;
        }
        
        public void setMsg(String msg) {
            this.msg = msg;
        }
        
        public Object getData() {
            return data;
        }
        
        public void setData(Object data) {
            this.data = data;
        }
    }
} 