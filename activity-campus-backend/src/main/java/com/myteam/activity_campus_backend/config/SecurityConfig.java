package com.myteam.activity_campus_backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * @author sjy15
 * @description: 安全配置
 * @date 2025/11/4 02:45
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        log.info("=== 配置Spring Security ===");
        http
                .csrf(csrf ->csrf.disable())
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.disable()) // 允许H2控制台iframe嵌入
                )

                .authorizeHttpRequests(authz -> authz
                        // 放行H2控制台相关路径
                        .requestMatchers("/h2-console/**").permitAll()
                        // 放行API路径
                        .requestMatchers("/api/user/login").permitAll()
                        .requestMatchers("/api/user/register").permitAll()
                        // 放行所有Swagger相关路径
                        .requestMatchers(
                                "/api/auth/refresh",
                                "/api/auth/check",
                                "/h2-console/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**",
                                "/doc.html",
                                "/favicon.ico",
                                "/error",
                                "/error/**"
                        ).permitAll()
                        .anyRequest().hasAnyAuthority("ROLE_USER")
                )
                // ⭐️ 添加JWT过滤器
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        log.info("🛡️ Spring Security配置完成");
        return http.build();
    }
}

