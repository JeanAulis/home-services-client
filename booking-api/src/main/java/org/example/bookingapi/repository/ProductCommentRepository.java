package org.example.bookingapi.repository;

import org.example.bookingapi.entity.ProductComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCommentRepository extends JpaRepository<ProductComment, Integer> {
    
    Page<ProductComment> findByProductNumAndStatus(String productNum, ProductComment.CommentStatus status, Pageable pageable);
    
    List<ProductComment> findByProductNumAndStatus(String productNum, ProductComment.CommentStatus status);
    
    Page<ProductComment> findByUserNumAndStatus(String userNum, ProductComment.CommentStatus status, Pageable pageable);
    
    Optional<ProductComment> findByOrderId(String orderId);
    
    @Query("SELECT COUNT(c) FROM ProductComment c WHERE c.productNum = :productNum AND c.status = :status")
    long countCommentsByProduct(@Param("productNum") String productNum, @Param("status") ProductComment.CommentStatus status);
    
    @Query("SELECT AVG(c.rating) FROM ProductComment c WHERE c.productNum = :productNum AND c.status = :status")
    Double getAverageRatingByProduct(@Param("productNum") String productNum, @Param("status") ProductComment.CommentStatus status);
    
    @Query("SELECT COUNT(c) FROM ProductComment c WHERE c.productNum = :productNum AND c.rating = :rating AND c.status = :status")
    long countCommentsByProductAndRating(@Param("productNum") String productNum, @Param("rating") Integer rating, @Param("status") ProductComment.CommentStatus status);
} 