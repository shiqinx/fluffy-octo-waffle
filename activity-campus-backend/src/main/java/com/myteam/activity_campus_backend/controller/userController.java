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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;



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
    private static final Logger logger = LoggerFactory.getLogger(userController.class);
    /**
     * 用户注册/激活接口
     */
    @PostMapping("/register")
    public ResponseEntity<UserRegisterResponse> register(@Valid @RequestBody UserRegisterRequest request) {
        try {
            logger.info("用户激活请求：userId={}", request.getUserId());
            UserRegisterResponse response = userService.registration(request);
            HttpStatus status;
            if(response.getStatus().equals("激活成功")){
                status=HttpStatus.OK;
            }else{
                status=getHttpStatus(response.getStatus());
            }
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            logger.error("用户注册异常: userId={}, error={}", request.getUserId(), e.getMessage());
            UserRegisterResponse errorResponse = new UserRegisterResponse("系统异常，请稍后重试", request.getUserId());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 用户登录接口
     */
    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@Valid @RequestBody UserLoginRequest request) {
        try {
            logger.info("用户登录请求：userId={}", request.getUserId());
            UserLoginResponse response = userService.login(request);

            HttpStatus status;
            if(response.getMessage().equals("登录成功")){
                status=HttpStatus.OK;
            }else{
                status=getHttpStatus(response.getMessage());
            }

            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            logger.error("用户登录异常: userId={}, error={}", request.getUserId(), e.getMessage());
            UserLoginResponse errorResponse = new UserLoginResponse("系统异常，请稍后重试", request.getUserId());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 修改密码接口
     */
    @PostMapping("/change-password")
    public ResponseEntity<ChangePasswordResponse> changePassword(@Valid @RequestBody ChangePasswordRequest updateRequest,
                                                                 HttpServletRequest request) {
        try {
            logger.info("用户修改密码：userId={}", updateRequest.getUserId());
            // 从请求属性中获取当前用户ID（由JWT拦截器设置）
            Integer currentUserId = (Integer) request.getAttribute("currentUserId");

            // 安全验证：确保用户只能修改自己的密码
            if (currentUserId == null || !currentUserId.equals(updateRequest.getUserId())) {
                ChangePasswordResponse errorResponse=new ChangePasswordResponse("无权修改其他用户密码", updateRequest.getUserId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(errorResponse);
            }

            ChangePasswordResponse response = userService.changePassword(updateRequest);

            HttpStatus status;
            if(response.getMessage().equals("密码修改成功")){
                status=HttpStatus.OK;
            }else{
                status=getHttpStatus(response.getMessage());
            }
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            ChangePasswordResponse errorResponse=new ChangePasswordResponse("系统异常，请稍后重试", updateRequest.getUserId());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }
    /**
     * 根据响应消息确定HTTP状态码
     */
    private HttpStatus getHttpStatus(String message) {
        switch (message) {
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
}