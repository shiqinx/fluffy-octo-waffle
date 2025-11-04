package com.myteam.activity_campus_backend.dto.request;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

/**
 * @author sjy15
 * @description: 用户实时位置写入数据库
 * @date 2025/11/3 02:37
 */
public class userLocationRequest {
    private Integer userId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Long validTime;
    public Integer getUserId() {
        return userId;
    }
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    public BigDecimal getLatitude() {
        return latitude;
    }
    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }
    public BigDecimal getLongitude() {
        return longitude;
    }
    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }
    public Long getValidTime() {
        return validTime;
    }
    public void setValidTime(Long validTime) {
        this.validTime = validTime;
    }
}
