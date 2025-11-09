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
     * 登录接口（示例）
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 这里应该是您的用户认证逻辑
        // boolean authenticated = userService.authenticate(loginRequest);

        // 模拟认证成功
        Integer userId = 123; // 从数据库获取的实际用户ID
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "USER");
        claims.put("username", "testuser");

        try {
            // 根据记住我选择不同的过期时间
            boolean rememberMe = loginRequest.isRememberMe();

            String accessToken = jwtTokenUtil.generateAccessToken(userId, claims, rememberMe);
            String refreshToken = jwtTokenUtil.generateRefreshToken(userId, rememberMe);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("tokenType", "Bearer");
            response.put("expiresIn", rememberMe ?
                    jwtTokenUtil.getRememberExpiration() / 1000 :
                    jwtTokenUtil.getAccessExpiration() / 1000);
            response.put("rememberMe", rememberMe);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "令牌生成失败"));
        }
    }

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

            // 生成新的访问令牌（自动继承记住我状态）
            String newAccessToken = jwtTokenUtil.refreshAccessToken(refreshToken);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("tokenType", "Bearer");
            response.put("expiresIn", jwtTokenUtil.getAccessExpiration() / 1000);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
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
            boolean isAboutToExpire = jwtTokenUtil.isTokenAboutToExpire(token, 15 * 60 * 1000);

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

    // 登录请求DTO
    public static class LoginRequest {
        private String username;
        private String password;
        private boolean rememberMe;

        // getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public boolean isRememberMe() { return rememberMe; }
        public void setRememberMe(boolean rememberMe) { this.rememberMe = rememberMe; }
    }
}
