package org.example.bookingapi.repository;

import org.example.bookingapi.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    Optional<Product> findByProductNum(String productNum);
    
    List<Product> findByProductType(String productType);
    
    Page<Product> findByProductTypeAndStatus(String productType, Product.ProductStatus status, Pageable pageable);
    
    Page<Product> findByStatus(Product.ProductStatus status, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.productName LIKE %:keyword% OR p.productDesc LIKE %:keyword%")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE (p.productName LIKE %:keyword% OR p.productDesc LIKE %:keyword%) AND p.status = :status")
    Page<Product> searchActiveProducts(@Param("keyword") String keyword, @Param("status") Product.ProductStatus status, Pageable pageable);
    
    @Query(value = "SELECT * FROM product WHERE product_type = :type ORDER BY sales_count DESC LIMIT :limit", nativeQuery = true)
    List<Product> findTopSellingByType(@Param("type") String type, @Param("limit") int limit);
    
    @Query(value = "SELECT * FROM product ORDER BY sales_count DESC LIMIT :limit", nativeQuery = true)
    List<Product> findTopSelling(@Param("limit") int limit);
    
    @Query(value = "SELECT * FROM product ORDER BY publish_date DESC LIMIT :limit", nativeQuery = true)
    List<Product> findLatestProducts(@Param("limit") int limit);
} 