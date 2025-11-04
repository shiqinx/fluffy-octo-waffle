package com.myteam.activity_campus_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * @author sjy15
 * @description: 同时解决编码和 Swagger 资源问题
 * @date 2025/11/4 02:26
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    // 1. 解决接口响应中文乱码
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        StringHttpMessageConverter converter = new StringHttpMessageConverter(StandardCharsets.UTF_8);
        converters.add(0, converter); // 优先使用 UTF-8 编码
    }

    // 2. 配置 Swagger 静态资源编码（解决文档乱码）
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 映射 Swagger UI 资源，并指定编码
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/springdoc-openapi-ui/")
                .setCachePeriod(0) // 禁用缓存，确保资源实时加载
                .resourceChain(false);
    }
}
