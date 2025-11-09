package com.myteam.activity_campus_backend.service;

import com.myteam.activity_campus_backend.util.BCryptUtil;
import org.springframework.stereotype.Component;

/**
 * @author sjy15
 * @description: 重构密码加密依赖
 * @date 2025/11/6 20:59
 */
@Component
public class PasswordService {
    public boolean matches(String rawPassword, String encodedPassword) {
        return BCryptUtil.matches(rawPassword, encodedPassword);
    }
    public String encrypt(String rawPassword) {
        return BCryptUtil.encrypt(rawPassword);
    }
}
