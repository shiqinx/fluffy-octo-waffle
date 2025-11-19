package com.myteam.activity_campus_backend.controller;

import com.myteam.activity_campus_backend.dto.BelongDTO;
import com.myteam.activity_campus_backend.dto.PartiDTO;
import com.myteam.activity_campus_backend.dto.request.UserBelongRequest;
import com.myteam.activity_campus_backend.dto.request.UserPartActivity;
import com.myteam.activity_campus_backend.dto.response.UserBelongResponse;
import com.myteam.activity_campus_backend.dto.response.UserPartActivityResponse;
import com.myteam.activity_campus_backend.service.BelongServer;
import com.myteam.activity_campus_backend.service.ParticipateServer;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

/**
 * @author sjy15
 * @description: 归属关系控制层（用户 - 团队 / 活动关联查询）
 * @date 2025/11/3 02:25
 */
@RestController
@RequestMapping("/api/belong")
public class BelongController {
    @Autowired
    private BelongServer belongServer;

    @Autowired
    private ParticipateServer participateServer;

    /**
     * 查询当前登录用户加入的团队列表
     * @param httpRequest HTTP请求对象（获取拦截器存入的当前用户ID）
     * @return 用户加入的团队列表响应
     */
    @GetMapping("/my-teams")
    public ResponseEntity<UserBelongResponse> getMyTeams(HttpServletRequest httpRequest) {
        // 从请求属性中获取当前登录用户ID（JWT拦截器已提前解析）
        Object currentUserId =httpRequest.getAttribute("currentUserId");
        if (currentUserId instanceof Integer) {
            Integer userNum = (Integer) currentUserId; // 安全的强制转换
            // 接下来可以使用num
            // 实例化请求对象（命名避免冲突，语义明确）
            UserBelongRequest userBelongRequest = new UserBelongRequest();
            userBelongRequest.setUserId(userNum);
            UserBelongResponse response = belongServer.getUserBelong(userBelongRequest);
            return ResponseEntity.ok(response);
        } else {
            String errorMessage = "用户ID类型错误，期望Integer，实际类型: " +
                    (currentUserId != null ? currentUserId.getClass().getName() : "null");
            System.out.println(errorMessage);

            // 返回完整的错误响应
            UserBelongResponse errorResponse = new UserBelongResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage(errorMessage);
            errorResponse.setBelongs(Collections.emptyList()); // 设置为空列表而不是null

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * 根据团队ID查询团队所有成员
     * @param teamId 团队ID（路径参数，确保请求目标明确）
     * @return 团队成员列表（BelongDTO封装成员信息）
     */
    @GetMapping("/team-members/{teamId}")
    public ResponseEntity<List<BelongDTO>> getTeamMembers(@PathVariable Integer teamId) {
        List<BelongDTO> memberList = belongServer.listBelongs(teamId);
        return ResponseEntity.ok(memberList);
    }


    /**
     * 根据活动ID查询活动所有参与者
     * @param activityId 活动ID（路径参数，符合RESTful规范）
     * @return 活动参与者列表（PartiDTO封装参与者信息）
     */
    @GetMapping("/activity-participants/{activityId}")
    public ResponseEntity<List<PartiDTO>> getActivityParticipants(@PathVariable Integer activityId) {
        List<PartiDTO> participantList = participateServer.list(activityId);
        return ResponseEntity.ok(participantList);
    }
}
