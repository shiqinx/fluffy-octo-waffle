package com.myteam.activity_campus_backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myteam.activity_campus_backend.util.JWTTokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

/**
 * @author sjy15
 * @description: 认证过滤器
 * @date 2025/11/18 23:05
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JWTTokenUtil jwtTokenUtil;
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private static final List<String> EXCLUDE_PATHS = Arrays.asList(
            "/h2-console/**",
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

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        log.info("=== 🔍 JWT过滤器开始处理请求 ===");
        log.info("📝 请求信息: {}",requestURI);
        log.info("🌐 请求来源: {}", request.getHeader("Origin"));
        log.info("📋 User-Agent: {}", request.getHeader("User-Agent"));

        // 检查排除路径
        if (isExcludePath(requestURI)) {
            log.info("✅ 路径被排除，直接放行: {}", requestURI);
            chain.doFilter(request, response);
            return;
        }else{
            log.info("🔐 需要认证的路径: {}", requestURI);
        }

        // 1. 提取和验证Token
        String token = jwtTokenUtil.extractToken(request);
        log.info("🔑 提取到的Token: {}", token != null ? "存在" : "NULL");

        if (token != null) {
            log.info("🔍 Token前缀检查: {}", token.startsWith("Bearer ") ? "正确" : "缺少Bearer前缀");
            log.info("📏 Token长度: {}", token.length());
        }

        if (token == null) {
            log.warn("❌ Token为空，返回401");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            sendJsonError(request,response, 401, "Token无效或已过期");
            return;
        }
        // 2. 验证Token有效性
        boolean isValid = jwtTokenUtil.validateToken(token);
        log.info("🔐 Token验证结果: {}", isValid ? "有效" : "无效");

        if (!isValid) {
            log.warn("❌ Token验证失败，返回401");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            sendJsonError(request,response, 401, "Token无效或已过期");
            return;
        }

        // 3. 解析用户信息并设置权限
        try {
            Integer userId = jwtTokenUtil.getUserIdFromToken(token);

            log.info("👤 从Token解析的用户ID: {}", userId);
            if (userId == null) {
                log.error("❌ 无法从Token解析用户ID");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                sendJsonError(request,response, 401, "令牌解析失败：用户ID为空");
                return;
            }
            // ⭐️ 关键修复：设置用户ID到请求属性
            request.setAttribute("currentUserId", userId);
            log.info("✅ 用户ID已设置到请求属性: currentUserId = {}", userId);

            // ⭐️ 关键：创建包含权限的认证对象
            List<GrantedAuthority> authorities = Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_USER") // 分配必要权限
            );

            log.info("🎯 分配的权限: {}", authorities);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("✅ 认证成功！用户ID: {} 已设置到SecurityContext", userId);
            log.info("🔐 SecurityContext认证状态: {}",
                    SecurityContextHolder.getContext().getAuthentication().isAuthenticated());
        } catch (Exception e) {
            log.error("❌ Token解析异常: {}", e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            sendJsonError(request,response, 401, "令牌解析失败: " + e.getMessage());
            return;
        }

        chain.doFilter(request, response);
    }
    /**
     * 发送JSON格式错误响应（解决乱码问题）
     */
    private void sendJsonError(HttpServletRequest request, HttpServletResponse response, int code, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("code", code);
        errorResponse.put("message", message);
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("path", request.getRequestURI());

        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(errorResponse);

        log.warn("🚫 返回错误响应: {}", json);
        response.getWriter().write(json);
    }


    /**
     * 改进的路径匹配逻辑
     */
    private boolean isExcludePath(String requestURI) {
        for (String path : EXCLUDE_PATHS) {
            if (path.endsWith("/**")) {
                String basePath = path.substring(0, path.length() - 3);
                if (requestURI.startsWith(basePath)) {
                    log.debug("✅ 路径匹配: {} -> {}", path, requestURI);
                    return true;
                }
            } else if (requestURI.equals(path) || requestURI.startsWith(path + "/")) {
                log.debug("✅ 精确匹配: {} -> {}", path, requestURI);
                return true;
            }
        }
        log.debug("❌ 路径需认证: {}", requestURI);
        return false;
    }
    /**
     * 添加请求头调试方法
     */
    private void debugHeaders(HttpServletRequest request) {
        log.info("=== 📋 请求头信息 ===");
        Collections.list(request.getHeaderNames()).forEach(headerName -> {
            if (headerName.toLowerCase().contains("auth") ||
                    headerName.toLowerCase().contains("token")) {
                log.info("   {}: {}", headerName, request.getHeader(headerName));
            }
        });
        log.info("====================");
    }
}


