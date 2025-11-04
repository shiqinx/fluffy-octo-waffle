package com.myteam.activity_campus_backend.repository;

import com.myteam.activity_campus_backend.entity.Activity;
import com.myteam.activity_campus_backend.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * @author sjy15
 * @description: 活动数据库操作
 * @date 2025/10/30 19:34
 */
@Repository
public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    // 检查同一地点同一时间是否有冲突活动
    @Query("SELECT COUNT(a) > 0 " +
            "FROM Activity a " +
            "WHERE " +
            "LOWER(TRIM(a.detailedAddress)) = LOWER(TRIM(:detailedAddress)) AND " +
            "((a.startTime BETWEEN :startTime AND :endTime) OR " +
            "(a.endTime BETWEEN :startTime AND :endTime) OR " +
            "(a.startTime <= :startTime AND a.endTime>= :endTime))")
    boolean existsConflictActivity(@Param("detailedAddress") String detailedAddress,
                                   @Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime);
    @Query("SELECT COUNT(a) > 0 "+
           "FROM Activity a "+
           "WHERE LOWER(TRIM(a.activityName)) = LOWER(TRIM(:activityName))")
    boolean existsByActivityName(@Param("activityName") String activityName);
    // 包含整数字段的模糊搜索（以 maxPeople 为例）
    @Query("SELECT a FROM Activity a WHERE " +
            // 字符串字段正常模糊匹配
            "a.activityName LIKE %:keyword% OR " +
            "a.activityDescription LIKE %:keyword% OR " +
            "a.publisher.userName LIKE %:keyword% OR " +
            "a.detailedAddress LIKE %:keyword% OR " +
            // 整数字段转换为字符串后模糊匹配（关键）
            "CAST(a.id AS string) LIKE %:keyword% OR " +
            "CAST(a.publisher.id AS string) LIKE %:keyword%")
    List<Activity> findByActivitiesLike(@Param("keyword") String keyword);

    Optional<Activity> findById(Integer activityId);
    @Query("SELECT a.location "+
            "FROM Activity a "+
            "WHERE a.id=:activityId")
    Location findLocationByActivityId(@Param("activityId") Integer activityId);
    @Query("SELECT a.id "+
            "FROM Activity a "+
            "WHERE a.activityName=:name")
    Integer findActivityIdByActivityName(@Param("name") String name);
}
