package org.example.bookingapi.repository;

import org.example.bookingapi.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserInfo, Integer> {
    Optional<UserInfo> findByUserNum(String userNum);
    
    Optional<UserInfo> findByUserName(String userName);
    
    Optional<UserInfo> findByUserEmail(String userEmail);
    
    boolean existsByUserNum(String userNum);
    
    boolean existsByUserName(String userName);
} 