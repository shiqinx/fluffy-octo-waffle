package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.dto.BelongDTO;

import java.util.List;

/**
 * @author sjy15
 * @description: 用户参与团队列表
 * @date 2025/11/2 23:46
 */
public class UserBelongResponse {
    private List<BelongDTO> belongs;
    private boolean success;
    private String message;
    public UserBelongResponse() {}
    public UserBelongResponse(List<BelongDTO> belongs, boolean success, String message) {
        this.belongs = belongs;
        this.success = success;
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public boolean isSuccess() {
        return success;
    }
    public void setSuccess(boolean success) {
        this.success = success;
    }

    public UserBelongResponse(List<BelongDTO> belongs) {
        this.belongs=belongs;
    }
    public List<BelongDTO> getBelongs() {
        return belongs;
    }
    public void setBelongs(List<BelongDTO> belongs) {
        this.belongs = belongs;
    }
}
