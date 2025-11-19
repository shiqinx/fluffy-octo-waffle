package com.myteam.activity_campus_backend.repository;

import com.myteam.activity_campus_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author sjy15
 * @description: 用户数据库操作
 * @date 2025/10/28 19:30
 */
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    //查找姓名
    Optional<User> findByUserName(String userName);
}
