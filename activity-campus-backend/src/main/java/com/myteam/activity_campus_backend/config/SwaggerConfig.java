package com.myteam.activity_campus_backend.config;


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


/**
 * @author sjy15
 * @description: 自定义 Swagger 配置类
 * @date 2025/11/4 03:15
 */
@Configuration
public class SwaggerConfig implements WebMvcConfigurer {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("校园活动平台 API 文档") // 中文标题
                        .description("校园活动平台的接口文档，包含用户、活动等模块") // 中文描述
                        .version("1.0.0"));
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new EncodingInterceptor())
                .addPathPatterns("/v3/api-docs/**", "/swagger-ui/**");
    }

    public static class EncodingInterceptor implements org.springframework.web.servlet.HandlerInterceptor {
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json;charset=UTF-8");
            return true;
        }
    }
}