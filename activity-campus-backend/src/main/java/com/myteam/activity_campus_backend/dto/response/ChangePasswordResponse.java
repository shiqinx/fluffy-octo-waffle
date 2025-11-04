package com.myteam.activity_campus_backend.dto.response;

/**
 * @author sjy15
 * @description: 用户修改密码响应DTO
 * @date 2025/10/26 14:20
 */
public class ChangePasswordResponse {
    private String message;
    private int userId;
    public ChangePasswordResponse(String message, int userId) {
        this.message = message;
        this.userId = userId;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public int getUserId() {
        return userId;
    }
    public void setUserId(int userId) {
        this.userId = userId;
    }
}
