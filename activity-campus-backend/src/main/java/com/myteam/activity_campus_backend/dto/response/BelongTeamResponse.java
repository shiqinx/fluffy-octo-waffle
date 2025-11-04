package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.dto.BelongDTO;
import com.myteam.activity_campus_backend.dto.TeamDTO;
import com.myteam.activity_campus_backend.dto.UserDTO;

/**
 * @author sjy15
 * @description: 参与团队响应
 * @date 2025/11/2 17:25
 */
public class BelongTeamResponse {
    private BelongDTO belong;
    private String message;
    public BelongTeamResponse(BelongDTO belong, String message) {
        this.belong = belong;
        this.message = message;
    }
    public BelongDTO getBelong() {
        return belong;
    }
    public void setBelong(BelongDTO belong) {
        this.belong = belong;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}
