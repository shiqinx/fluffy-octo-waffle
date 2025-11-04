package com.myteam.activity_campus_backend.controller;

import com.myteam.activity_campus_backend.util.JWTTokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * @author sjy15
 * @description: 认证控制器
 * @date 2025/11/4 11:26
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private JWTTokenUtil jwtTokenUtil;

    /**
     * 刷新令牌接口
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String refreshToken = jwtTokenUtil.extractTokenFromHeader(authorizationHeader);

            if (refreshToken == null || !jwtTokenUtil.validateToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "刷新令牌无效或已过期"));
            }

            // 生成新的访问令牌
            String newAccessToken = jwtTokenUtil.refreshAccessToken(refreshToken);

            // 可选：生成新的刷新令牌（滚动刷新，增强安全性）
            Integer userId = jwtTokenUtil.getUserIdFromToken(refreshToken);
            String newRefreshToken = jwtTokenUtil.generateRefreshToken(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", newRefreshToken);
            response.put("tokenType", "Bearer");
            response.put("expiresIn", jwtTokenUtil.getAccessExpiration() / 1000); // 秒

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "令牌刷新失败: " + e.getMessage()));
        }
    }

    /**
     * 检查令牌状态
     */
    @GetMapping("/check")
    public ResponseEntity<?> checkToken(HttpServletRequest request) {
        String token = jwtTokenUtil.extractToken(request);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false, "message", "缺少令牌"));
        }

        try {
            boolean isValid = jwtTokenUtil.validateToken(token);
            boolean isAboutToExpire = jwtTokenUtil.isTokenAboutToExpire(token, 15 * 60 * 1000); // 15分钟

            Map<String, Object> response = new HashMap<>();
            response.put("valid", isValid);
            response.put("aboutToExpire", isAboutToExpire);

            if (isValid) {
                Integer userId = jwtTokenUtil.getUserIdFromToken(token);
                response.put("userId", userId);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false, "message", "令牌无效"));
        }
    }
}
