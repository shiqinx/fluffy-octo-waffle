package com.myteam.activity_campus_backend.controller;

import com.myteam.activity_campus_backend.dto.request.LocationRequest;
import com.myteam.activity_campus_backend.service.LocationServer;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author sjy15
 * @description: 地图控制器
 * @date 2025/11/3 15:17
 */
@RestController
@RequestMapping("/api/location")
public class LocationController {
    @Autowired
    private LocationServer locationServer; // 注入区域位置服务层

    /**
     * 保存区域位置信息
     * @param locationRequest 前端传入的区域位置请求参数（包含区域名称、中心点坐标等）
     * @return 响应结果（成功/失败提示）
     */
    @PostMapping("/save")
    public ResponseEntity<String> saveLocation(@Valid @RequestBody LocationRequest locationRequest) {
        try {
            // 调用服务层保存逻辑
            locationServer.save(locationRequest);
            return ResponseEntity.ok("区域位置信息保存成功");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("区域位置信息保存失败：" + e.getMessage());
        }
    }
}
