package com.myteam.activity_campus_backend.controller;

import com.myteam.activity_campus_backend.dto.request.userLocationRequest;
import com.myteam.activity_campus_backend.service.UserLocationServer;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author sjy15
 * @description: 用户实时位置
 * @date 2025/11/3 15:13
 */
@RestController
@RequestMapping("/api/user-location")
public class UserLocationController {
    @Autowired
    private UserLocationServer userLocationServer; // 注入用户位置服务层

    /**
     * 保存用户实时位置
     * @param ulRequest 前端传入的用户位置请求参数（包含用户ID、经纬度、有效时间等）
     * @return 响应结果（成功/失败提示）
     */
    @PostMapping("/save")
    public ResponseEntity<String> saveUserLocation(@Valid @RequestBody userLocationRequest ulRequest) {
        try {
            // 调用服务层保存逻辑
            userLocationServer.save(ulRequest);
            // 服务层无异常抛出，说明保存成功或已处理过期逻辑
            return ResponseEntity.ok("用户位置保存成功（若有效时间未过期）");
        } catch (Exception e) {
            // 捕获异常（如参数错误、数据库异常等）
            return ResponseEntity.badRequest().body("用户位置保存失败：" + e.getMessage());
        }
    }
}
