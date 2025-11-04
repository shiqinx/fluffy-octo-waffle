package com.myteam.activity_campus_backend.dto.request;

/**
 * @author sjy15
 * @description: 查看活动详情
 * @date 2025/10/31 21:55
 */
public class CheckActivityRequest {
    private Integer activityId;
    public Integer getActivityId() {
        return activityId;
    }
    public void setActivityId(Integer activityId) {
        this.activityId = activityId;
    }
}
