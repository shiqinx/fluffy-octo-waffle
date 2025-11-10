package com.myteam.activity_campus_backend;

import com.myteam.activity_campus_backend.service.PasswordService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

/**
 * @author sjy15
 * @description:密码服务层测试
 * @date 2025/11/10 19:08
 */
@ExtendWith(MockitoExtension.class)
public class PasswordServiceTest {
    private final PasswordService passwordService = new PasswordService();
    //测试正常密码加密：加密后的值不应与原密码相同，且长度符合 BCrypt 加密特征（60 字符左右）
    @Test
    public void encrypt_NormalPassword_ReturnsEncoded() {
        // 准备测试数据
        String rawPassword = "TestPassword123!";

        // 调用加密方法
        String encodedPassword = passwordService.encrypt(rawPassword);

        // 验证结果
        assertNotNull(encodedPassword);
        assertNotEquals(rawPassword, encodedPassword); // 加密后与原密码不同
        assertTrue(encodedPassword.length() >= 60); // BCrypt 加密后长度通常为 60 字符
        assertTrue(encodedPassword.startsWith("$2a$") || encodedPassword.startsWith("$2b$") || encodedPassword.startsWith("$2y$")); // BCrypt 前缀特征
    }
    /**
     * 测试密码匹配：原始密码与加密后的密码应匹配
     */
    @Test
    public void matches_CorrectPassword_ReturnsTrue() {
        // 准备测试数据
        String rawPassword = "User@123456";
        String encodedPassword = passwordService.encrypt(rawPassword); // 先用服务加密

        // 验证匹配结果
        boolean isMatch = passwordService.matches(rawPassword, encodedPassword);
        assertTrue(isMatch);
    }

    /**
     * 测试密码不匹配：错误的原始密码与加密后的密码应不匹配
     */
    @Test
    public void matches_WrongPassword_ReturnsFalse() {
        // 准备测试数据
        String rawPassword = "CorrectPassword";
        String wrongPassword = "WrongPassword";
        String encodedPassword = passwordService.encrypt(rawPassword);

        // 验证匹配结果
        boolean isMatch = passwordService.matches(wrongPassword, encodedPassword);
        assertFalse(isMatch);
    }

    /**
     * 测试加密后的密码唯一性：同一原始密码多次加密结果应不同（BCrypt 特性，随机盐值）
     */
    @Test
    public void encrypt_SamePassword_MultipleTimes_ReturnsDifferentEncoded() {
        // 准备测试数据
        String rawPassword = "SamePassword123";

        // 多次加密同一密码
        String encoded1 = passwordService.encrypt(rawPassword);
        String encoded2 = passwordService.encrypt(rawPassword);

        // 验证结果：两次加密结果不同（因盐值随机）
        assertNotEquals(encoded1, encoded2);
    }

    /**
     * 测试特殊字符密码：包含特殊字符的密码应能正常加密和匹配
     */
    @Test
    public void encryptAndMatch_PasswordWithSpecialChars_Works() {
        // 准备测试数据（包含特殊字符）
        String rawPassword = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

        // 加密
        String encodedPassword = passwordService.encrypt(rawPassword);

        // 验证匹配
        assertTrue(passwordService.matches(rawPassword, encodedPassword));
        assertFalse(passwordService.matches(rawPassword + "extra", encodedPassword)); // 错误密码不匹配
    }
}
