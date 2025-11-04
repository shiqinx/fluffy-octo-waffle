package com.myteam.activity_campus_backend.dto.request;

/**
 * @author sjy15
 * @description: 团队创建申请
 * @date 2025/11/2 03:11
 */
public class TeamCreateRequest {
    private Integer userId;
    private String TeamName;
    public Integer getUserId() {
        return userId;
    }
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    public String getTeamName() {
        return TeamName;
    }
    public void setTeamName(String TeamName) {
        this.TeamName = TeamName;
    }
}
