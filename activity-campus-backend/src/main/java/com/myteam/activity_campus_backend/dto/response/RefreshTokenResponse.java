package com.myteam.activity_campus_backend.dto.response;

/**
 * @author sjy15
 * @description: 刷新令牌响应
 * @date 2025/10/28 10:23
 */
public class RefreshTokenResponse {
    private boolean success;
    private String message;
    private String newToken;     // 新的JWT
    private String refreshToken; // 新的刷新令牌
    private Long expiresIn;//告诉客户端令牌的有效期剩余时间
    public boolean isSuccess() {
        return success;
    }
    public void setSuccess(boolean success) {
        this.success = success;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public String getNewToken() {
        return newToken;
    }
    public void setNewToken(String newToken) {
        this.newToken = newToken;
    }
    public String getRefreshToken() {
        return refreshToken;
    }
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    public Long getExpiresIn() {
        return expiresIn;
    }
    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }
}
