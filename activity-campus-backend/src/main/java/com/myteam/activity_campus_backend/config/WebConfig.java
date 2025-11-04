package com.myteam.activity_campus_backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @author sjy15
 * @description: 拦截器配置
 * @date 2025/11/3 01:32
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Getter
    @Setter
    @Autowired
    private JwtInterceptor jwtInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 重要：必须在注册时也排除这些路径
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/swagger-resources/**",
                        "/v2/api-docs",
                        "/v3/api-docs",
                        "/v3/api-docs/**",
                        "/webjars/**",
                        "/doc.html",
                        "/favicon.ico",
                        "/error",
                        "/error/**"
                );
    }
}
