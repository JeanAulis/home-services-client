package org.example.bookingapi.controller;

import org.example.bookingapi.entity.Product;
import org.example.bookingapi.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/product")
public class ProductController {

    @Autowired
    private ProductService productService;

    // 获取商品详情
    @GetMapping("/detail")
    public Object getProductDetail(@RequestParam String productNum) {
        Product product = productService.getProductByNum(productNum);
        if (product == null) {
            return new Result(404, "商品不存在", null);
        }
        
        // 获取商品统计信息（评分、评论数等）
        Map<String, Object> statistics = productService.getProductStatistics(productNum);
        
        // 组合商品信息和统计信息
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("product", product);
        responseData.put("statistics", statistics);
        
        return new Result(200, "获取商品详情成功", responseData);
    }
    
    // 获取商品列表
    @GetMapping("/list")
    public Object getProductList(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishDate") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {
        
        try {
            // 创建分页和排序
            Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
            Sort sort = Sort.by(direction, sortBy);
            Pageable pageable = PageRequest.of(page - 1, size, sort);
            
            Page<Product> products;
            
            // 根据是否指定了type获取不同的商品列表
            if (type != null && !type.isEmpty()) {
                products = productService.getProductsByType(type, pageable);
            } else {
                products = productService.getProducts(pageable);
            }
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("products", products.getContent());
            responseData.put("currentPage", products.getNumber() + 1);
            responseData.put("totalItems", products.getTotalElements());
            responseData.put("totalPages", products.getTotalPages());
            
            return new Result(200, "获取商品列表成功", responseData);
        } catch (Exception e) {
            return new Result(500, "获取商品列表失败: " + e.getMessage(), null);
        }
    }
    
    // 搜索商品
    @GetMapping("/search")
    public Object searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<Product> products = productService.searchProducts(keyword, pageable);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("products", products.getContent());
            responseData.put("currentPage", products.getNumber() + 1);
            responseData.put("totalItems", products.getTotalElements());
            responseData.put("totalPages", products.getTotalPages());
            
            return new Result(200, "搜索商品成功", responseData);
        } catch (Exception e) {
            return new Result(500, "搜索商品失败: " + e.getMessage(), null);
        }
    }
    
    // 获取热门商品
    @GetMapping("/hot")
    public Object getHotProducts(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "10") int limit) {
        
        try {
            List<Product> hotProducts;
            
            if (type != null && !type.isEmpty()) {
                hotProducts = productService.getHotProductsByType(type, limit);
            } else {
                hotProducts = productService.getHotProducts(limit);
            }
            
            return new Result(200, "获取热门商品成功", hotProducts);
        } catch (Exception e) {
            return new Result(500, "获取热门商品失败: " + e.getMessage(), null);
        }
    }
    
    // 获取新品
    @GetMapping("/new")
    public Object getNewProducts(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<Product> newProducts = productService.getNewProducts(limit);
            return new Result(200, "获取新品成功", newProducts);
        } catch (Exception e) {
            return new Result(500, "获取新品失败: " + e.getMessage(), null);
        }
    }
    
    // 创建商品（管理员接口）
    @PostMapping("/create")
    public Object createProduct(@RequestBody Product product) {
        try {
            Product createdProduct = productService.createProduct(product);
            return new Result(200, "创建商品成功", createdProduct);
        } catch (Exception e) {
            return new Result(500, "创建商品失败: " + e.getMessage(), null);
        }
    }
    
    // 更新商品（管理员接口）
    @PutMapping("/update")
    public Object updateProduct(
            @RequestParam String productNum,
            @RequestBody Product product) {
        
        try {
            Product updatedProduct = productService.updateProduct(productNum, product);
            if (updatedProduct == null) {
                return new Result(404, "商品不存在", null);
            }
            return new Result(200, "更新商品成功", updatedProduct);
        } catch (Exception e) {
            return new Result(500, "更新商品失败: " + e.getMessage(), null);
        }
    }
    
    // 更新商品状态（管理员接口）
    @PutMapping("/status")
    public Object updateProductStatus(
            @RequestParam String productNum,
            @RequestParam String status) {
        
        try {
            Product.ProductStatus productStatus = Product.ProductStatus.valueOf(status.toUpperCase());
            boolean success = productService.updateProductStatus(productNum, productStatus);
            
            if (!success) {
                return new Result(404, "商品不存在", null);
            }
            
            return new Result(200, "更新商品状态成功", null);
        } catch (IllegalArgumentException e) {
            return new Result(400, "无效的商品状态", null);
        } catch (Exception e) {
            return new Result(500, "更新商品状态失败: " + e.getMessage(), null);
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