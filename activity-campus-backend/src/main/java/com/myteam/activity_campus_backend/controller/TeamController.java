package com.myteam.activity_campus_backend.controller;

import com.myteam.activity_campus_backend.dto.request.BelongTeamRequest;
import com.myteam.activity_campus_backend.dto.request.ResearchTeamRequest;
import com.myteam.activity_campus_backend.dto.request.TeamCreateRequest;
import com.myteam.activity_campus_backend.dto.response.BelongTeamResponse;
import com.myteam.activity_campus_backend.dto.response.ResearchTeamResponse;
import com.myteam.activity_campus_backend.dto.response.TeamCreateResponse;
import com.myteam.activity_campus_backend.service.TeamServer;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author sjy15
 * @description: 团队控制层
 * @date 2025/11/3 02:16
 */
@RestController
@RequestMapping("/api/team")
public class TeamController {
    @Autowired
    private TeamServer teamServer;

    /**
     * 创建团队
     * @param httpRequest HTTP请求对象（用于获取当前登录用户ID）
     * @param createRequest 团队创建请求参数
     * @return 团队创建结果
     */
    @PostMapping("/create")
    public ResponseEntity<TeamCreateResponse> createTeam(
            HttpServletRequest httpRequest,
            @RequestBody TeamCreateRequest createRequest) {
        // 从请求属性性中获取当前登录用户ID（JWT拦截器已解析）
        String currentUserId = (String) httpRequest.getAttribute("currentUserId");
        // 绑定创建者为当前登录用户，防止越权
        createRequest.setUserId(Integer.valueOf(currentUserId));
        TeamCreateResponse response = teamServer.createTeam(createRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * 申请加入团队
     * @param applyRequest 加入团队的请求参数（包含用户ID和团队ID）
     * @return 申请结果
     */
    @PostMapping("/apply")
    public ResponseEntity<BelongTeamResponse> applyJoinTeam(
            @RequestBody BelongTeamRequest applyRequest) {
        BelongTeamResponse response = teamServer.belongTeam(applyRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * 同意加入团队的申请（团队主理人操作）
     * @param applyAgreement 包含申请信息的同意请求
     * @return 同意处理结果
     */
    @PostMapping("/agree-apply")
    public ResponseEntity<BelongTeamResponse> agreeApply(
            @RequestBody BelongTeamResponse applyAgreement) {
        BelongTeamResponse response = teamServer.agreeTeam(applyAgreement);
        return ResponseEntity.ok(response);
    }

    /**
     * 搜索团队（按关键词匹配团队名称等信息）
     * @param keyword 搜索关键词
     * @return 符合条件的团队列表
     */
    @GetMapping("/search")
    public ResponseEntity<ResearchTeamResponse> searchTeam(
            @RequestParam String keyword) {
        ResearchTeamRequest searchRequest = new ResearchTeamRequest(keyword);
        ResearchTeamResponse response = teamServer.listResearchTeam(searchRequest);
        return ResponseEntity.ok(response);
    }
}
