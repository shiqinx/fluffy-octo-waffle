package com.myteam.activity_campus_backend.dto.response;

import lombok.Getter;
import lombok.Setter;

/**
 * @author sjy15
 * @description: 错误响应 DTO
 * @date 2025/11/12 14:10
 */
@Getter
@Setter
public class ErrorResponse {
    private String message;
    private Long timestamp;
    private String path;

    public ErrorResponse(String message, String path) {
        this.message = message;
        this.timestamp = System.currentTimeMillis();
        this.path = path;
    }
}
