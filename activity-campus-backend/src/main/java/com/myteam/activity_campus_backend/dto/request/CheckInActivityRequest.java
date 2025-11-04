package com.myteam.activity_campus_backend.dto.request;

/**
 * @author sjy15
 * @description: 活动签到
 * @date 2025/11/1 15:32
 */
public class CheckInActivityRequest {
    private Integer userId;
    private Integer activityId;
    public CheckInActivityRequest(Integer userId, Integer activityId) {
        this.userId = userId;
        this.activityId = activityId;
    }
    public Integer getUserId() {
        return userId;
    }
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    public Integer getActivityId() {
        return activityId;
    }
    public void setActivityId(Integer activityId) {
        this.activityId = activityId;
    }
}
