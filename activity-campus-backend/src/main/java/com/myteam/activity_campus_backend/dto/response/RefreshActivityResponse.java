package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.dto.UserDTO;

/**
 * @author sjy15
 * @description: 活动人数更新
 * @date 2025/10/30 20:41
 */
public class RefreshActivityResponse {
    private Integer ActivityId;
    private UserDTO publisherId;
    private Integer currentPeople;
    public RefreshActivityResponse(Integer ActivityId, UserDTO publisherId, Integer currentPeople) {
        this.ActivityId = ActivityId;
        this.publisherId = publisherId;
        this.currentPeople = currentPeople;
    }
    public Integer getActivityId() {
        return ActivityId;
    }
    public void setActivityId(Integer ActivityId) {
        this.ActivityId = ActivityId;
    }
    public UserDTO getPublisherId() {
        return publisherId;
    }
    public void setPublisherId(UserDTO publisherId) {
        this.publisherId = publisherId;
    }
    public Integer getCurrentPeople() {
        return currentPeople;
    }
    public void setCurrentPeople(Integer currentPeople) {
        this.currentPeople = currentPeople;
    }
}
