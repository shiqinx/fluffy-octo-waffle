package com.myteam.activity_campus_backend.dto.response;


/**
 * @author sjy15
 * @description: 用户激活响应DTO，服务端——>客户端，答复或提供
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
    public int getUserId() {
        return userId;
    }
    public void setUserId(int userId) {
        this.userId = userId;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}
