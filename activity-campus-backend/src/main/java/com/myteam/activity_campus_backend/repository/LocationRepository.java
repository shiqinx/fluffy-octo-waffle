package com.myteam.activity_campus_backend.repository;

import com.myteam.activity_campus_backend.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
*   @author sjy15
*   @description: 地图数据库
*   @date 2025/10/31 14:35
*/
@Repository
public interface LocationRepository extends JpaRepository<Location, Integer> {
    Location findByDetailAddress(String detailAddress);
}
