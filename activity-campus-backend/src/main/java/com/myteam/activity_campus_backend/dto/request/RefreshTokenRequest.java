package com.myteam.activity_campus_backend.dto.request;

/**
 * @author sjy15
 * @description: 刷新令牌请求
 * @date 2025/10/28 10:22
 */
public class RefreshTokenRequest {
    private String refreshToken;
    public RefreshTokenRequest(){}
    public String getRefreshToken() {
        return refreshToken;
    }
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
