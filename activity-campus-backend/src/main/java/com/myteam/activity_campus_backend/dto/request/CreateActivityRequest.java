package com.myteam.activity_campus_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * @author sjy15
 * @description: 创建活动请求
 * @date 2025/10/30 20:17
 */
public class CreateActivityRequest {
    @NotBlank(message="创办者不能为空")
    private String publisherName;
    @NotBlank(message="活动名称不能为空")
    private String activityName;
    private String activityDescription;
    @NotBlank(message="活动详细地址不能为空")
    private String locationDescription;
    @NotNull(message="活动报名时间不能为空")
    private LocalDateTime registrationTime;
    @NotNull(message="活动报名截止时间不能为空")
    private LocalDateTime registrationEndTime;
    @NotNull(message="活动时间不能为空")
    private LocalDateTime startTime;
    @NotNull(message="活动截止时间不能为空")
    private LocalDateTime endTime;
    @NotNull(message = "活动最大人数不能为空")
    private Integer maxPeople;
    public String getPublisherName() {
        return publisherName;
    }
    public void setPublisherName(String publisherName) {
        this.publisherName = publisherName;
    }
    public String getActivityName() {
        return activityName;
    }
    public void setActivityName(String activityName) {
        this.activityName = activityName;
    }
    public String getActivityDescription() {
        return activityDescription;
    }
    public void setActivityDescription(String activityDescription) {
        this.activityDescription = activityDescription;
    }

    public String getLocationDescription() {
        return locationDescription;
    }
    public void setLocationDescription(String locationDescription) {
        this.locationDescription = locationDescription;
    }
    public LocalDateTime getRegistrationTime() {
        return registrationTime;
    }
    public void setRegistrationTime(LocalDateTime registrationTime) {
        this.registrationTime = registrationTime;
    }
    public LocalDateTime getRegistrationEndTime() {
        return registrationEndTime;
    }
    public void setRegistrationEndTime(LocalDateTime registrationEndTime) {
        this.registrationEndTime = registrationEndTime;
    }
    public LocalDateTime getStartTime() {
        return startTime;
    }
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    public LocalDateTime getEndTime() {
        return endTime;
    }
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    public Integer getMaxPeople() {
        return maxPeople;
    }
    public void setMaxPeople(Integer maxPeople) {
        this.maxPeople = maxPeople;
    }
}
