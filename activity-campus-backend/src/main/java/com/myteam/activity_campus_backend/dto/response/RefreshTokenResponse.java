package com.myteam.activity_campus_backend.dto.response;

import lombok.Getter;
import lombok.Setter;

/**
 * @author sjy15
 * @description: 刷新令牌响应 DTO
 * @date 2025/11/12 14:05
 */
@Setter
@Getter
public class RefreshTokenResponse {
    private String accessToken;
    private String tokenType;
    private Long expiresIn;

    // 构造方法
    public RefreshTokenResponse() {}

    public RefreshTokenResponse(String accessToken, String tokenType, Long expiresIn) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
    }

}
