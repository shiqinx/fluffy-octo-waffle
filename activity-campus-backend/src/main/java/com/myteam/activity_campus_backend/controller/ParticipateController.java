package com.myteam.activity_campus_backend.controller;

import com.myteam.activity_campus_backend.dto.PartiDTO;
import com.myteam.activity_campus_backend.dto.request.UserPartActivity;
import com.myteam.activity_campus_backend.dto.response.UserPartActivityResponse;
import com.myteam.activity_campus_backend.service.ParticipateServer;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author sjy15
 * @description: 参与活动控制器：处理用户与活动的关联查询（用户找活动、活动找用户）
 * @date 2025/11/3 15:21
 */
@RestController
@RequestMapping("/api/participate")
public class ParticipateController {
    @Autowired
    private ParticipateServer participateServer;

    /**
     * 用户查询自己参与的活动列表（用户找活动）
     * @param userPartActivity 请求参数（包含用户ID等信息）
     * @return 响应结果（用户参与的活动列表）
     */
    @PostMapping("/user/activities")
    public ResponseEntity<UserPartActivityResponse> getUserParticipatedActivities(
            @Valid @RequestBody UserPartActivity userPartActivity) {
        try {
            // 调用服务层获取用户参与的活动列表
            UserPartActivityResponse response = participateServer.activityList(userPartActivity);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * 查询参与某个活动的用户列表（活动找用户）
     * @param activityId 活动ID
     * @return 参与该活动的用户DTO列表
     */
    @GetMapping("/activity/users")
    public ResponseEntity<List<PartiDTO>> getActivityParticipants(
            @RequestParam @Valid Integer activityId) {
        try {
            // 调用服务层获取参与活动的用户列表
            List<PartiDTO> partiDTOs = participateServer.list(activityId);
            return ResponseEntity.ok(partiDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
