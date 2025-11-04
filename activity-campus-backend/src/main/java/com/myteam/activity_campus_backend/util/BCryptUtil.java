package com.myteam.activity_campus_backend.util;

import org.springframework.security.crypto.bcrypt.BCrypt;

/**
 *   @author sjy15
 *   @description: 密码加密
 *   @date 2025/10/31 14:53
 */
public class BCryptUtil {
    // 加密：明文密码 → 加密后的哈希串（含盐值）
    public static String encrypt(String rawPassword) {
        // 生成盐值（工作因子 10，可调整为 11/12，值越大越耗时）
        String salt = BCrypt.gensalt(10);
        // 用盐值加密明文密码
        return BCrypt.hashpw(rawPassword, salt);
    }

    // 校验：明文密码 + 数据库存储的哈希串 → 是否匹配
    public static boolean matches(String rawPassword, String encodedPassword) {
        // BCrypt 会自动从 encodedPassword 中提取盐值，与明文密码重新计算后对比
        return BCrypt.checkpw(rawPassword, encodedPassword);
    }
}
