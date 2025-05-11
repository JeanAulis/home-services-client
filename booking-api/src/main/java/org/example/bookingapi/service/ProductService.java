package org.example.bookingapi.service;

import org.example.bookingapi.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface ProductService {
    
    // 获取商品详情
    Product getProductByNum(String productNum);
    
    // 获取商品列表（分页）
    Page<Product> getProducts(Pageable pageable);
    
    // 按类型获取商品
    Page<Product> getProductsByType(String productType, Pageable pageable);
    
    // 搜索商品
    Page<Product> searchProducts(String keyword, Pageable pageable);
    
    // 获取热门商品
    List<Product> getHotProducts(int limit);
    
    // 获取新品
    List<Product> getNewProducts(int limit);
    
    // 按类型获取热门商品
    List<Product> getHotProductsByType(String type, int limit);
    
    // 获取商品统计信息
    Map<String, Object> getProductStatistics(String productNum);
    
    // 创建商品
    Product createProduct(Product product);
    
    // 更新商品
    Product updateProduct(String productNum, Product product);
    
    // 更新商品状态
    boolean updateProductStatus(String productNum, Product.ProductStatus status);
    
    // 更新销量
    boolean updateSalesCount(String productNum, int count);
    
    // 检查商品库存
    boolean checkStock(String productNum, int quantity);
} 