package com.myteam.activity_campus_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * @author sjy15
 * @description: 用户登录请求DTO
 * @date 2025/10/26 14:05
 */
public class UserLoginRequest {
    @NotNull(message = "用户ID不能为空")
    private Integer userId;
    @NotBlank(message = "密码不能为空")
    private String userPassword;
    private boolean rememberMe=false;
    public UserLoginRequest(Integer userId, boolean rememberMe, String userPassword) {
        this.userId = userId;
        this.userPassword = userPassword;
        this.rememberMe=rememberMe;
    }
    public Integer getUserId() {
        return userId;
    }
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    public String getUserPassword() {
        return userPassword;
    }
    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }
    public boolean isRememberMe() {//用于获取 rememberMe 属性的当前值，主要在业务逻辑中用于条件判断
        return rememberMe;
    }
    public void setRememberMe(boolean rememberMe) {//用于设置或修改 rememberMe 属性的值
        this.rememberMe = rememberMe;
    }
}
