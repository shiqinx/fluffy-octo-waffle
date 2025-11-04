package com.myteam.activity_campus_backend.dto.request;

/**
 * @author sjy15
 * @description: 参加团队请求
 * @date 2025/11/2 17:25
 */
public class BelongTeamRequest {
    private Integer userId;
    private Integer teamId;
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    public void setTeamId(Integer teamId) {
        this.teamId = teamId;
    }
    public Integer getUserId() {
        return userId;
    }
    public Integer getTeamId() {
        return teamId;
    }
}
