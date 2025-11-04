package com.myteam.activity_campus_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @author sjy15
 * @description: 用户修改密码请求DTO
 * @date 2025/10/26 14:20
 */
public class ChangePasswordRequest {
    @NotBlank(message = "用户ID不能为空")
    private int userId;
    @NotBlank(message = "密码不能为空")
    private String user_OldPassword;
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码长度至少6位")
    private String user_NewPassword;
    public ChangePasswordRequest(int userId, String user_OldPassword, String user_NewPassword) {
        this.userId = userId;
        this.user_OldPassword = user_OldPassword;
        this.user_NewPassword = user_NewPassword;
    }
    public int getUserId() {
        return userId;
    }
    public void setUserId(int userId) {
        this.userId = userId;
    }
    public String getUser_OldPassword() {
        return user_OldPassword;
    }
    public void setUser_OldPassword(String user_OldPassword) {
        this.user_OldPassword = user_OldPassword;
    }
    public String getUser_NewPassword() {
        return user_NewPassword;
    }
    public void setUser_NewPassword(String user_NewPassword) {
        this.user_NewPassword = user_NewPassword;
    }

}
