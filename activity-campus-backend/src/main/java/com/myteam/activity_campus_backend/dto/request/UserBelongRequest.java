package com.myteam.activity_campus_backend.dto.request;

/**
 * @author sjy15
 * @description: 用户参与团队
 * @date 2025/11/2 23:45
 */
public class UserBelongRequest {
    private Integer userId;
    public Integer getUserId() {
        return userId;
    }
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}
