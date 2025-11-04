package com.myteam.activity_campus_backend.dto;

/**
 * @author sjy15
 * @description: 用户非敏感数据
 * @date 2025/11/1 00:02
 */
public class UserDTO {
    private Integer user_id;
    private String username;
    public Integer getUser_id() {
        return user_id;
    }
    public void setUser_id(Integer user_id) {
        this.user_id = user_id;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
}
