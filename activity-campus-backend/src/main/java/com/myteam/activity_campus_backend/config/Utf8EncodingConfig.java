package com.myteam.activity_campus_backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * @author sjy15
 * @description: 强制的编码过滤器
 * @date 2025/11/4 09:26
 */
@Configuration
public class Utf8EncodingConfig {
    @Bean
    public FilterRegistrationBean<Utf8Filter> utf8Filter() {
        FilterRegistrationBean<Utf8Filter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new Utf8Filter());
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }

    public static class Utf8Filter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                        FilterChain filterChain) throws IOException, ServletException {
            request.setCharacterEncoding("UTF-8");
            response.setCharacterEncoding("UTF-8");
            response.setContentType("text/plain;charset=UTF-8");
            filterChain.doFilter(request, response);
        }
    }
}
