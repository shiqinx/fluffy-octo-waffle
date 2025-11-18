package com.myteam.activity_campus_backend.config;

import com.myteam.activity_campus_backend.util.JWTTokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * @author sjy15
 * @description: 认证过滤器
 * @date 2025/11/18 23:05
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JWTTokenUtil jwtTokenUtil;

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

        // 检查排除路径
        if (isExcludePath(requestURI)) {
            chain.doFilter(request, response);
            return;
        }

        // 1. 提取和验证Token
        String token = jwtTokenUtil.extractToken(request);
        if (token == null || !jwtTokenUtil.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"message\":\"请先登录\"}");
            return;
        }

        // 2. 解析用户信息并设置权限
        try {
            Integer userId = jwtTokenUtil.getUserIdFromToken(token);

            // ⭐️ 关键：创建包含权限的认证对象
            List<GrantedAuthority> authorities = Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_USER") // 分配必要权限
            );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"message\":\"令牌无效\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isExcludePath(String requestURI) {
        return EXCLUDE_PATHS.stream().anyMatch(path ->
                requestURI.equals(path) || requestURI.startsWith(path.replace("**", ""))
        );
    }
}
