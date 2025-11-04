package com.myteam.activity_campus_backend.controller;

import com.myteam.activity_campus_backend.dto.request.ChangePasswordRequest;
import com.myteam.activity_campus_backend.dto.request.UserLoginRequest;
import com.myteam.activity_campus_backend.dto.request.UserRegisterRequest;
import com.myteam.activity_campus_backend.dto.response.ChangePasswordResponse;
import com.myteam.activity_campus_backend.dto.response.UserLoginResponse;
import com.myteam.activity_campus_backend.dto.response.UserRegisterResponse;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author sjy15
 * @description: 处理API请求与响应
 * @date 2025/10/26 00:57
 */
@RestController
@RequestMapping("/api/user")
public class userController {
    @Autowired
    private UserService userService;

    // 注册接口（无需Token）
    @PostMapping("/register")
    public UserRegisterResponse register(@RequestBody UserRegisterRequest request) {
        return userService.registration(request);
    }

    // 登录接口（无需Token，成功返回Token）
    @PostMapping("/login")
    public UserLoginResponse login(@RequestBody UserLoginRequest request) {
        return userService.login(request);
    }

    // 修改密码（需Token，从请求属性获取当前用户ID）
    @PostMapping("/change-password")
    public ChangePasswordResponse changePassword(
            HttpServletRequest request,
            @RequestBody ChangePasswordRequest passwordRequest) {
        // 从拦截器存入的属性中获取当前登录用户ID
        String currentUserId = (String) request.getAttribute("currentUserId");
        passwordRequest.setUserId(Integer.parseInt(currentUserId)); // 强制使用登录用户ID，防止越权
        return userService.changePassword(passwordRequest);
    }
}
