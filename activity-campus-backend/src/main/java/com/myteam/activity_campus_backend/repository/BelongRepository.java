package com.myteam.activity_campus_backend.repository;

import com.myteam.activity_campus_backend.entity.Belong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author sjy15
 * @description: 隶属团队数据库
 * @date 2025/11/2 02:27
 */
@Repository
public interface BelongRepository extends JpaRepository<Belong, Integer> {
    @Query("SELECT b "+"FROM Belong b "+"WHERE b.user.id=:id OR b.team.id=:id")
    List<Belong> findByUser_IdOrTeam_Id(@Param("id") Integer Id);
}
