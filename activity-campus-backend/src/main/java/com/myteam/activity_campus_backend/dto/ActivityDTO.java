package com.myteam.activity_campus_backend.dto;

import com.myteam.activity_campus_backend.entity.Activity;
import com.myteam.activity_campus_backend.entity.Location;
import com.myteam.activity_campus_backend.entity.User;

import java.time.LocalDateTime;

/**
 * @author sjy15
 * @description: 活动不包含保密信息
 * @date 2025/11/2 01:51
 */
public class ActivityDTO {
    private Integer id;
    private UserDTO publisher;
    private String activityName;
    private String activityDescription;
    private Location location;
    private String detailedAddress;
    private LocalDateTime registrationTime;
    private LocalDateTime registrationEndTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxPeople;
    private Integer currentPeople;
    public ActivityDTO() {}

    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }
    public UserDTO getPublisher() {
        return publisher;
    }
    public void setPublisher(UserDTO publisher) {
        this.publisher = publisher;
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
    public Location getLocation() {
        return location;
    }
    public void setLocation(Location location) {
        this.location = location;
    }
    public String getDetailedAddress() {
        return detailedAddress;
    }
    public void setDetailedAddress(String detailedAddress) {
        this.detailedAddress = detailedAddress;
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
    public Integer getCurrentPeople() {
        return currentPeople;
    }
    public void setCurrentPeople(Integer currentPeople) {
        this.currentPeople = currentPeople;
    }

    public static ActivityDTO convert(Activity activity) {
        UserDTO user=new UserDTO();
        user.setUser_id(activity.getPublisher().getId());
        user.setUsername(activity.getPublisher().getUserName());
        ActivityDTO dto=new ActivityDTO();
        dto.setId(activity.getId());
        dto.setPublisher(user);
        dto.setActivityName(activity.getActivityName());
        dto.setActivityDescription(activity.getActivityDescription());
        dto.setLocation(activity.getLocation());
        dto.setDetailedAddress(activity.getDetailedAddress());
        dto.setRegistrationTime(activity.getRegistrationTime());
        dto.setRegistrationEndTime(activity.getRegistrationEndTime());
        dto.setStartTime(activity.getStartTime());
        dto.setMaxPeople(activity.getMaxPeople());
        dto.setCurrentPeople(activity.getCurrentPeople());
        return dto;
    }
}
