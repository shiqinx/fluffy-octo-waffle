package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.dto.TeamDTO;

/**
 * @author sjy15
 * @description:团队创建响应
 * @date 2025/11/2 16:08
 */
public class TeamCreateResponse {
    private TeamDTO team;
    private boolean success;
    private String message;
    public TeamCreateResponse(TeamDTO team, boolean success, String message) {
        this.team = team;
        this.success = success;
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

    public TeamDTO getTeam() {
        return team;
    }
    public void setTeam(TeamDTO team) {
        this.team = team;
    }
    public boolean isSuccess() {
        return success;
    }
    public void setSuccess(boolean success) {
        this.success = success;
    }
}
