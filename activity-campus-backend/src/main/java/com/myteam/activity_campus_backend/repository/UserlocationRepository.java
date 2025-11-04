package com.myteam.activity_campus_backend.repository;

import com.myteam.activity_campus_backend.entity.Userlocation;
import org.springdoc.core.service.GenericParameterService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * @author sjy15
 * @description: 用户实时位置操作
 * @date 2025/11/1 15:20
 */
@Repository
public interface UserlocationRepository extends JpaRepository<Userlocation, Integer> {
    @Query(value = "SELECT * FROM userlocation l WHERE l.user_Id = :userId AND l.valid_Time > UNIX_TIMESTAMP() * 1000", nativeQuery = true)
    Optional<Userlocation> findByUserId(@Param("userId") Integer userId); // 方法名优化（移除冗余下划线）
}
