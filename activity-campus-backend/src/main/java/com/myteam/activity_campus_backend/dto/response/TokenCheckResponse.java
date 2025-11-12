package com.myteam.activity_campus_backend.dto.response;

import lombok.Getter;
import lombok.Setter;

/**
 * @author sjy15
 * @description: 令牌检查响应 DTO
 * @date 2025/11/12 14:06
 */
@Setter
@Getter
public class TokenCheckResponse {
    private Boolean valid;
    private Boolean aboutToExpire;
    private Integer userId;
    private String message;
    // 构造方法
    public TokenCheckResponse() {}

    public TokenCheckResponse(Boolean valid, Boolean aboutToExpire, Integer userId, String message) {
        this.valid = valid;
        this.aboutToExpire = aboutToExpire;
        this.userId = userId;
        this.message = message;
    }
    // 成功情况的工厂方法
    public static TokenCheckResponse success(Boolean valid, Boolean aboutToExpire, Integer userId) {
        return new TokenCheckResponse(valid, aboutToExpire, userId, null);
    }

    // 失败情况的工厂方法
    public static TokenCheckResponse error(String message) {
        return new TokenCheckResponse(false, false, null, message);
    }

}
