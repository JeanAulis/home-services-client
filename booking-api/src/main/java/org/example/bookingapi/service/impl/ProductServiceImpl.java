package org.example.bookingapi.service.impl;

import org.example.bookingapi.entity.Product;
import org.example.bookingapi.repository.ProductCommentRepository;
import org.example.bookingapi.repository.ProductRepository;
import org.example.bookingapi.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductCommentRepository commentRepository;

    @Override
    public Product getProductByNum(String productNum) {
        return productRepository.findByProductNum(productNum).orElse(null);
    }

    @Override
    public Page<Product> getProducts(Pageable pageable) {
        return productRepository.findByStatus(Product.ProductStatus.ACTIVE, pageable);
    }

    @Override
    public Page<Product> getProductsByType(String productType, Pageable pageable) {
        return productRepository.findByProductTypeAndStatus(productType, Product.ProductStatus.ACTIVE, pageable);
    }

    @Override
    public Page<Product> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchActiveProducts(keyword, Product.ProductStatus.ACTIVE, pageable);
    }

    @Override
    public List<Product> getHotProducts(int limit) {
        return productRepository.findTopSelling(limit);
    }

    @Override
    public List<Product> getNewProducts(int limit) {
        return productRepository.findLatestProducts(limit);
    }

    @Override
    public List<Product> getHotProductsByType(String type, int limit) {
        return productRepository.findTopSellingByType(type, limit);
    }

    @Override
    public Map<String, Object> getProductStatistics(String productNum) {
        Map<String, Object> statistics = new HashMap<>();
        
        // 获取评论数量
        long totalComments = commentRepository.countCommentsByProduct(productNum, org.example.bookingapi.entity.ProductComment.CommentStatus.VISIBLE);
        statistics.put("totalComments", totalComments);
        
        // 获取平均评分
        Double avgRating = commentRepository.getAverageRatingByProduct(productNum, org.example.bookingapi.entity.ProductComment.CommentStatus.VISIBLE);
        statistics.put("averageRating", avgRating != null ? avgRating : 0);
        
        // 获取评分分布
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            long count = commentRepository.countCommentsByProductAndRating(productNum, i, org.example.bookingapi.entity.ProductComment.CommentStatus.VISIBLE);
            ratingDistribution.put(i, count);
        }
        statistics.put("ratingDistribution", ratingDistribution);
        
        return statistics;
    }

    @Override
    @Transactional
    public Product createProduct(Product product) {
        // 设置初始状态和时间
        if (product.getStatus() == null) {
            product.setStatus(Product.ProductStatus.ACTIVE);
        }
        if (product.getPublishDate() == null) {
            product.setPublishDate(LocalDateTime.now());
        }
        if (product.getStock() == null) {
            product.setStock(0);
        }
        if (product.getSalesCount() == null) {
            product.setSalesCount(0);
        }
        product.setUpdatedAt(LocalDateTime.now());
        
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product updateProduct(String productNum, Product product) {
        Optional<Product> existingProductOpt = productRepository.findByProductNum(productNum);
        if (existingProductOpt.isPresent()) {
            Product existingProduct = existingProductOpt.get();
            
            // 更新属性，保留不变的属性
            if (product.getProductName() != null) {
                existingProduct.setProductName(product.getProductName());
            }
            if (product.getPrice() != null) {
                existingProduct.setPrice(product.getPrice());
            }
            if (product.getProductLink() != null) {
                existingProduct.setProductLink(product.getProductLink());
            }
            if (product.getProductImages() != null) {
                existingProduct.setProductImages(product.getProductImages());
            }
            if (product.getProductVideo() != null) {
                existingProduct.setProductVideo(product.getProductVideo());
            }
            if (product.getProductDesc() != null) {
                existingProduct.setProductDesc(product.getProductDesc());
            }
            if (product.getProductType() != null) {
                existingProduct.setProductType(product.getProductType());
            }
            if (product.getServiceArea() != null) {
                existingProduct.setServiceArea(product.getServiceArea());
            }
            if (product.getStock() != null) {
                existingProduct.setStock(product.getStock());
            }
            if (product.getStatus() != null) {
                existingProduct.setStatus(product.getStatus());
            }
            
            existingProduct.setUpdatedAt(LocalDateTime.now());
            
            return productRepository.save(existingProduct);
        }
        return null;
    }

    @Override
    @Transactional
    public boolean updateProductStatus(String productNum, Product.ProductStatus status) {
        Optional<Product> productOpt = productRepository.findByProductNum(productNum);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setStatus(status);
            product.setUpdatedAt(LocalDateTime.now());
            productRepository.save(product);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public boolean updateSalesCount(String productNum, int count) {
        Optional<Product> productOpt = productRepository.findByProductNum(productNum);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            // 更新销量和库存
            int currentSales = product.getSalesCount() != null ? product.getSalesCount() : 0;
            product.setSalesCount(currentSales + count);
            
            // 减少库存
            if (product.getStock() != null) {
                product.setStock(product.getStock() - count);
            }
            
            product.setUpdatedAt(LocalDateTime.now());
            productRepository.save(product);
            return true;
        }
        return false;
    }

    @Override
    public boolean checkStock(String productNum, int quantity) {
        Optional<Product> productOpt = productRepository.findByProductNum(productNum);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            // 检查库存是否足够
            return product.getStock() != null && product.getStock() >= quantity;
        }
        return false;
    }
} 