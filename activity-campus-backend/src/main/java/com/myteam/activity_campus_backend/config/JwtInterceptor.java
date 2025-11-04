package com.myteam.activity_campus_backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
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

    @Getter
    @Setter
    @Autowired
    private JWTTokenUtil jwtTokenUtil; // 注入新的工具类

    // 定义需要排除的 API 文档路径
    private static final List<String> EXCLUDE_PATHS = Arrays.asList(
            "/swagger-ui.html",
            "/swagger-ui/",
            "/swagger-ui/**",  // 添加通配符模式
            "/swagger-resources",
            "/swagger-resources/**",
            "/v2/api-docs",
            "/v3/api-docs",
            "/v3/api-docs/**",  // 添加通配符
            "/webjars/",
            "/webjars/**",
            "/doc.html",
            "/favicon.ico",
            "/error",
            "/error/**"
    );
    /**
     * 改进的路径匹配方法
     */
    private boolean isExcludePath(String requestURI) {
        // 完全匹配
        if (EXCLUDE_PATHS.contains(requestURI)) {
            return true;
        }

        // 前缀匹配（处理子路径）
        return EXCLUDE_PATHS.stream().anyMatch(excludePath -> {
            if (excludePath.endsWith("/")) {
                // 对于以/结尾的路径，匹配所有子路径
                return requestURI.startsWith(excludePath);
            } else {
                // 对于具体路径，只匹配该路径及其直接子路径
                return requestURI.equals(excludePath) ||
                        requestURI.startsWith(excludePath + "/");
            }
        });
    }

   @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestURI = request.getRequestURI();

        // 添加调试信息
        System.out.println("JWT拦截器 - 请求路径: " + requestURI);

        // 检查是否为需要排除的 API 文档路径
        if (isExcludePath(requestURI)) {
            System.out.println("JWT拦截器 - 路径已排除: " + requestURI);
            return true; // 直接放行，不进行 JWT 验证
        }

        System.out.println("JWT拦截器 - 进行JWT验证: " + requestURI);

        // 1. 从请求头提取Token
        String token = jwtTokenUtil.extractToken(request);

        if (token == null) {
            System.out.println("JWT拦截器 - Token为空");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            sendErrorResponse(response, "请先登录（缺少Token）");
            return false;
        }
        // 2. 验证Token有效性
        if (!jwtTokenUtil.validateToken(token)) {
            System.out.println("JWT拦截器 - Token无效");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            sendErrorResponse(response, "Token无效或已过期");
            return false;
        }

        // 3. 解析Token中的用户ID
        Integer userId = jwtTokenUtil.getUserIdFromToken(token);
        request.setAttribute("currentUserId", userId);
        System.out.println("JWT拦截器 - 验证通过, 用户ID: " + userId);

        // 检查令牌是否即将过期
        if (jwtTokenUtil.isTokenAboutToExpire(token, 15 * 60 * 1000)) {
            response.setHeader("X-Token-Expiring-Soon", "true");
        }

        return true;
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