package com.myteam.activity_campus_backend.controller;

import com.myteam.activity_campus_backend.dto.request.ChangePasswordRequest;
import com.myteam.activity_campus_backend.dto.request.UserLoginRequest;
import com.myteam.activity_campus_backend.dto.request.UserRegisterRequest;
import com.myteam.activity_campus_backend.dto.response.ChangePasswordResponse;
import com.myteam.activity_campus_backend.dto.response.UserLoginResponse;
import com.myteam.activity_campus_backend.dto.response.UserRegisterResponse;
import com.myteam.activity_campus_backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * @author sjy15
 * @description: 处理API请求与响应
 * @date 2025/10/26 00:57
 */
@RestController
@RequestMapping("/api/user")
@Validated
public class userController {

    @Autowired
    private UserService userService;

    /**
     * 用户注册/激活接口
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegisterRequest request) {
        try {
            UserRegisterResponse response = userService.registration(request);

            Map<String, Object> result = new HashMap<>();
            result.put("code", getResponseCode(response.getStatus()));
            result.put("message", response.getStatus());
            result.put("userId", response.getUserId());
            result.put("timestamp", System.currentTimeMillis());

            HttpStatus status = getHttpStatus(response.getStatus());
            return ResponseEntity.status(status).body(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("系统异常，请稍后重试"));
        }
    }

    /**
     * 用户登录接口
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginRequest request) {
        try {
            UserLoginResponse response = userService.login(request);

            Map<String, Object> result = new HashMap<>();
            result.put("code", getResponseCode(response.getMessage()));
            result.put("message", response.getMessage());
            result.put("userId", response.getUserId());
            result.put("timestamp", System.currentTimeMillis());

            // 登录成功时返回令牌信息
            if ("登录成功".equals(response.getMessage())) {
                result.put("accessToken", response.getToken());
                result.put("refreshToken", response.getRefreshToken());
                result.put("tokenType", "Bearer");
                result.put("rememberMe", request.isRememberMe());
            }

            HttpStatus status = getHttpStatus(response.getMessage());
            return ResponseEntity.status(status).body(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("登录系统异常，请稍后重试"));
        }
    }

    /**
     * 修改密码接口
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                            HttpServletRequest httpRequest) {
        try {
            // 从请求属性中获取当前用户ID（由JWT拦截器设置）
            Integer currentUserId = (Integer) httpRequest.getAttribute("currentUserId");

            // 安全验证：确保用户只能修改自己的密码
            if (currentUserId == null || !currentUserId.equals(request.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("无权修改其他用户密码"));
            }

            ChangePasswordResponse response = userService.changePassword(request);

            Map<String, Object> result = new HashMap<>();
            result.put("code", getResponseCode(response.getMessage()));
            result.put("message", response.getMessage());
            result.put("userId", response.getUserId());
            result.put("timestamp", System.currentTimeMillis());

            HttpStatus status = getHttpStatus(response.getMessage());
            return ResponseEntity.status(status).body(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("系统异常，请稍后重试"));
        }
    }


    /**
     * 用户登出接口
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            Integer currentUserId = (Integer) request.getAttribute("currentUserId");

            Map<String, Object> result = new HashMap<>();
            result.put("code", 200);
            result.put("message", "登出成功");
            result.put("userId", currentUserId);
            result.put("timestamp", System.currentTimeMillis());

            // 注意：JWT是无状态的，实际登出需要前端删除令牌
            // 如果需要服务端登出，可以维护一个黑名单

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("登出失败"));
        }
    }

    /**
     * 根据响应消息确定HTTP状态码
     */
    private HttpStatus getHttpStatus(String message) {
        switch (message) {
            case "注册成功":
            case "激活成功":
            case "登录成功":
            case "密码修改成功":
                return HttpStatus.OK;
            case "用户已启用":
            case "用户未激活":
                return HttpStatus.CONFLICT;
            case "用户名错误":
            case "密码错误":
            case "原密码错误":
            case "账号不存在":
            case "用户不存在":
                return HttpStatus.BAD_REQUEST;
            default:
                return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    /**
     * 根据响应消息确定业务状态码
     */
    private int getResponseCode(String message) {
        switch (message) {
            case "注册成功":
            case "激活成功":
            case "登录成功":
            case "密码修改成功":
                return 200;
            case "用户已启用":
            case "用户未激活":
                return 409;
            case "用户名错误":
            case "密码错误":
            case "原密码错误":
            case "账号不存在":
            case "用户不存在":
                return 400;
            default:
                return 500;
        }
    }

    /**
     * 创建错误响应
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("code", 500);
        errorResponse.put("message", message);
        errorResponse.put("timestamp", System.currentTimeMillis());
        return errorResponse;
    }
}