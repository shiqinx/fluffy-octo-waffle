package com.myteam.activity_campus_backend.controller;

import com.myteam.activity_campus_backend.config.JwtAuthenticationFilter;
import com.myteam.activity_campus_backend.dto.response.ErrorResponse;
import com.myteam.activity_campus_backend.dto.response.RefreshTokenResponse;
import com.myteam.activity_campus_backend.dto.response.TokenCheckResponse;
import com.myteam.activity_campus_backend.util.JWTTokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;



/**
 * @author sjy15
 * @description: 认证控制器
 * @date 2025/11/4 11:26
 */
@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    @Autowired
    private JWTTokenUtil jwtTokenUtil;

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    /**
     * 刷新令牌接口
     */
    @PostMapping("/refresh")
    public ResponseEntity<Object> refreshToken(
            @RequestHeader("Authorization")
            @NotBlank(message = "Authorization header不能为空")
            String authorizationHeader) {

        log.info("🔄 刷新令牌请求");
        try {
            String refreshToken = jwtTokenUtil.extractTokenFromHeader(authorizationHeader);

            if (refreshToken == null || !jwtTokenUtil.validateToken(refreshToken)) {
                ErrorResponse error = new ErrorResponse(
                        "刷新令牌无效或已过期",
                        "/api/auth/refresh"
                );
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // 生成新访问令牌
            String newAccessToken = jwtTokenUtil.refreshAccessToken(refreshToken);

            RefreshTokenResponse response = new RefreshTokenResponse(
                    newAccessToken,
                    "Bearer",
                    jwtTokenUtil.getAccessExpiration() / 1000
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(
                    "令牌刷新失败: " + e.getMessage(),
                    "/api/auth/refresh"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     *检查令牌状态
     */
    @GetMapping("/check")
    public ResponseEntity<TokenCheckResponse> checkToken(HttpServletRequest request) {
        String token = jwtTokenUtil.extractToken(request);

        if (token == null) {
            TokenCheckResponse response = TokenCheckResponse.error("缺少令牌");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            boolean isValid = jwtTokenUtil.validateToken(token);
            boolean isAboutToExpire = jwtTokenUtil.isTokenAboutToExpire(token, 15 * 60 * 1000);

            TokenCheckResponse response;
            if (isValid) {
                Integer userId = jwtTokenUtil.getUserIdFromToken(token);
                response = TokenCheckResponse.success(isValid, isAboutToExpire, userId);
            } else {
                response = TokenCheckResponse.error("令牌无效");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            TokenCheckResponse response = TokenCheckResponse.error("令牌验证异常");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}

