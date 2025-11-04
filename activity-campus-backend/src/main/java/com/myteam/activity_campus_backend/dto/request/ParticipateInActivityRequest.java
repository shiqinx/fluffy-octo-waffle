package com.myteam.activity_campus_backend.dto.request;

/**
 * @author sjy15
 * @description: 活动报名请求
 * @date 2025/10/30 14:00
 */
public class ParticipateInActivityRequest {
    private Integer activityId;
    private Integer userId;
    private String message;
    public ParticipateInActivityRequest(Integer activityId, Integer userId, String message) {
        this.activityId = activityId;
        this.userId = userId;
        this.message = message;
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
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}
