package com.myteam.activity_campus_backend.repository;

import com.myteam.activity_campus_backend.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
*   @author sjy15
*   @description: 团队数据库
*   @date 2025/11/2 02:26
*/
@Repository
public interface  TeamRepository extends JpaRepository<Team, Integer> {
    @Query("SELECT t.id "+
            "FROM Team t "+
            "WHERE t.teamName=:name")
    Optional<Integer> findIdByTeamName(@Param("name") String teamName);
    @Query("SELECT t FROM Team t WHERE "+
            "CAST(t.creator.id AS String) LIKE %:key% OR "+
            "CAST(t.id AS String) LIKE %:key% OR "+
            "t.teamName LIKE %:key%")
    List<Team> findByCreator_IdLikeOrIdLikeOrTeamNameLike(@Param("key") String keyword);
}
