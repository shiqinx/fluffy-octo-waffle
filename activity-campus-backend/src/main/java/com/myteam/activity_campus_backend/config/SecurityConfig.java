package com.myteam.activity_campus_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * @author sjy15
 * @description: 安全配置
 * @date 2025/11/4 02:45
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.disable()) // 允许H2控制台iframe嵌入
                )
                .authorizeHttpRequests(authz -> authz
                        // 放行H2控制台相关路径
                        .requestMatchers("/h2-console/**").permitAll()
                        // 放行H2控制台的静态资源
                        .requestMatchers("/h2-console/**/*.css").permitAll()
                        .requestMatchers("/h2-console/**/*.js").permitAll()
                        // 放行所有Swagger相关路径
                        .requestMatchers(
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
                        // 其他请求需要认证
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}