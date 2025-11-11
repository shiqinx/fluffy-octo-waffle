package com.myteam.activity_campus_backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.util.JWTTokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
*   @author sjy15
*   @description: JWT拦截器
*   @date 2025/11/3 01:13
*/
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JWTTokenUtil jwtTokenUtil;

    // 排除路径列表
    private static final List<String> EXCLUDE_PATHS = Arrays.asList(
            "/api/user/login",
            "/api/user/register",
            "/api/auth/refresh",
            "/api/auth/check",
            "/swagger-ui.html",
            "/swagger-ui/",
            "/swagger-ui/**",
            "/swagger-resources",
            "/swagger-resources/**",
            "/v2/api-docs",
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/webjars/",
            "/webjars/**",
            "/doc.html",
            "/favicon.ico",
            "/error",
            "/error/**"
    );

    private boolean isExcludePath(String requestURI) {
        if (EXCLUDE_PATHS.contains(requestURI)) {
            return true;
        }

        return EXCLUDE_PATHS.stream().anyMatch(excludePath -> {
            if (excludePath.endsWith("/")) {
                return requestURI.startsWith(excludePath);
            } else {
                return requestURI.equals(excludePath) ||
                        requestURI.startsWith(excludePath + "/");
            }
        });
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestURI = request.getRequestURI();

        // 检查排除路径
        if (isExcludePath(requestURI)) {
            return true;
        }

        // 1. 从请求头提取Token
        String token = jwtTokenUtil.extractToken(request);

        if (token == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            sendErrorResponse(response, "请先登录（缺少Token）");
            return false;
        }

        // 2. 验证Token有效性
        if (!jwtTokenUtil.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            sendErrorResponse(response, "Token无效或已过期");
            return false;
        }

        // 3. 解析Token中的用户ID
        try {
            Integer userId = jwtTokenUtil.getUserIdFromToken(token);
            request.setAttribute("currentUserId", userId);

            // 检查令牌是否即将过期（15分钟内）
            if (jwtTokenUtil.isTokenAboutToExpire(token, 15 * 60 * 1000)) {
                response.setHeader("X-Token-Expiring-Soon", "true");
            }

            return true;
        } catch (RuntimeException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            sendErrorResponse(response, "令牌解析失败");
            return false;
        }
    }

    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setContentType("application/json;charset=UTF-8");

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("code", 401);
        errorResponse.put("message", message);
        errorResponse.put("timestamp", System.currentTimeMillis());

        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(errorResponse));
    }
}
