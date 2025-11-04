package com.myteam.activity_campus_backend.dto.response;

/**
 * @author sjy15
 * @description: 用户注册响应DTO，服务端——>客户端，答复或提供
 * @date 2025/10/26 14:06
 */
public class UserRegisterResponse {
    private int userId;
    private String message;
    public UserRegisterResponse() {}
    public UserRegisterResponse(String status, int userId) {
        this.message = status;
        this.userId = userId;
    }
    public String getStatus() {
        return message;
    }
    public void setStatus(String status) {
        this.message = status;
    }
    public int getUserId() {
        return userId;
    }
    public void setUserId(int userId) {
        this.userId = userId;
    }
}
