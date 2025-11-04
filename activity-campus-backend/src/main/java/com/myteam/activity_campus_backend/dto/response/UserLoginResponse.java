package com.myteam.activity_campus_backend.dto.response;


/**
 * @author sjy15
 * @description: 用户登录响应DTO
 * @date 2025/10/26 14:07
 */
public class UserLoginResponse {
    private String message;
    private int userId;
    private String token=null;
    private String refreshToken=null;
    public UserLoginResponse(String message, int userId) {
        this.message = message;
        this.userId = userId;
    }
    public UserLoginResponse(String message, int userId, String token) {
        this.message = message;
        this.userId = userId;
        this.token = token;
    }
    public UserLoginResponse(String message, int userId, String token, String refreshToken) {
        this.message = message;
        this.userId = userId;
        this.token = token;
        this.refreshToken = refreshToken;
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
    public String getToken() {
        return token;
    }
    public void setToken(String token) {
        this.token = token;
    }
    public String getRefreshToken() {
        return refreshToken;
    }
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
