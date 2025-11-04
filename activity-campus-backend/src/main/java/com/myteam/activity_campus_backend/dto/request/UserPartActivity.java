package com.myteam.activity_campus_backend.dto.request;

/**
 * @author sjy15
 * @description: 用户参与活动申请
 * @date 2025/11/2 22:39
 */
public class UserPartActivity {
    private Integer userId;

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    public Integer getUserId() {
        return userId;
    }
}
