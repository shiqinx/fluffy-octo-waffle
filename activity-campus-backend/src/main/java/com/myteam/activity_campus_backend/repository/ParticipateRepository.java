package com.myteam.activity_campus_backend.repository;

import com.myteam.activity_campus_backend.entity.Participate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author sjy15
 * @description: 报名数据库操作
 * @date 2025/10/31 23:43
 */
@Repository
public interface ParticipateRepository extends JpaRepository<Participate, Integer> {
    @Query("SELECT p "+
            "FROM Participate p "+
            "WHERE p.participant.id=:id OR p.activity.id=:id")
    List<Participate> findByParticipant_IdOrActivity_Id(@Param("id") Integer id);
}
