package com.myteam.activity_campus_backend.dto.request;

/**
 * @author sjy15
 * @description: 活动报名请求
 * @date 2025/10/30 14:00
 */
public class ParticipateInActivityRequest {
    private Integer activityId;
    private Integer userId;
    public ParticipateInActivityRequest(Integer activityId, Integer userId) {
        this.activityId = activityId;
        this.userId = userId;
    }
    public Integer getActivityId() {
        return activityId;
    }
    public void setActivityId(Integer activityId) {
        this.activityId = activityId;
    }
    public Integer getuserId() {
        return userId;
    }
    public void setuserId(Integer userId) {
        this.userId = userId;
    }
}
