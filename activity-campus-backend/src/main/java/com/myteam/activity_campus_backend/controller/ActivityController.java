package com.myteam.activity_campus_backend.controller;

import com.myteam.activity_campus_backend.dto.MessageSendDTO;
import com.myteam.activity_campus_backend.dto.request.*;
import com.myteam.activity_campus_backend.dto.response.*;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.repository.UserRepository;
import com.myteam.activity_campus_backend.service.ActivityServer;
import com.myteam.activity_campus_backend.service.MessageServer;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


/**
 * @author sjy15
 * @description: 活动控制器
 * @date 2025/10/30 19:49
 */
@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    @Autowired
    private ActivityServer activityServer;

    @Autowired
    private UserRepository userRepository;

    /**
     * 创建活动
     * @param httpRequest HTTP请求对象（用于获取当前用户ID）
     * @param createRequest 活动创建请求参数
     * @return 活动创建结果
     */
    @PostMapping("/create")
    public ResponseEntity<simpleActivityResponse> createActivity(
            HttpServletRequest httpRequest,
            @RequestBody CreateActivityRequest createRequest) {
        Object currentUserId =httpRequest.getAttribute("currentUserId");
        if(currentUserId instanceof Integer){
            Integer userNum = (Integer) currentUserId;
            User currentUser = userRepository.findById(userNum).orElseThrow();
            createRequest.setPublisherName(currentUser.getUserName());
            simpleActivityResponse response = activityServer.getsimpleActivityResponse(createRequest);
            return ResponseEntity.ok(response);
        }else{
            String errorMsg = "用户ID类型错误，期望Integer，实际类型: " +
                    (currentUserId != null ? currentUserId.getClass().getSimpleName() : "null");
            return ResponseEntity.badRequest()
                    .body(new simpleActivityResponse(null, false, errorMsg));
        }

    }

    /**
     * 查询活动列表
     * @param keyword 搜索关键词（活动名称、描述等）
     * @return 活动列表结果
     */
    @GetMapping("/list")
    public ResponseEntity<CheckListActivityResponse> getActivityList(@RequestParam String keyword) {
        ActivityListRequest listRequest = new ActivityListRequest(keyword);
        CheckListActivityResponse response = activityServer.ActivityListResponse(listRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * 查询活动详情
     * @param activityId 活动ID
     * @return 活动详情结果
     */
    @GetMapping("/detail/{activityId}")
    public ResponseEntity<simpleActivityResponse> getActivityDetail(@PathVariable Integer activityId) {
        CheckActivityRequest detailRequest = new CheckActivityRequest();
        detailRequest.setActivityId(activityId);
        simpleActivityResponse response = activityServer.DetailActivityResponse(detailRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * 申请参加活动
     * @param httpRequest HTTP请求对象（用于获取当前用户ID）
     * @param joinRequest 活动参与请求参数
     * @return 参与申请结果
     */
    @PostMapping("/join")
    public ResponseEntity<ParticipateInActivityResponse> joinActivity(
            HttpServletRequest httpRequest,
            @RequestBody ParticipateInActivityRequest joinRequest) {
        Object currentUserId = httpRequest.getAttribute("currentUserId");
        if(currentUserId instanceof Integer){
            Integer userNum = (Integer) currentUserId;
            joinRequest.setuserId(userNum);
            ParticipateInActivityResponse response = activityServer.participateInActivityResponse(joinRequest);
            return ResponseEntity.ok(response);
        }else{
            String errorMsg = "用户ID类型错误，期望Integer，实际类型: " +
                    (currentUserId != null ? currentUserId.getClass().getSimpleName() : "null");
            return ResponseEntity.badRequest()
                    .body(new ParticipateInActivityResponse(null,null,errorMsg));
        }
    }

    /**
     * 同意活动参与申请
     * @param agreement 同意申请的参数
     * @return 同意结果
     */
    @PostMapping("/agree-join")
    public ResponseEntity<ParticipateInActivityResponse> agreeJoin(
            @RequestBody ParticipateInActivityResponse agreement) {
        ParticipateInActivityResponse response = activityServer.publisherAgreement(agreement);
        activityServer.refresh(response);
        return ResponseEntity.ok(response);
    }

    /**
     * 活动签到
     * @param httpRequest HTTP请求对象（用于获取当前用户ID）
     * @param checkInRequest 签到请求参数
     * @return 签到结果
     */
    @PostMapping("/check-in")
    public ResponseEntity<CheckInActivityResponse> checkIn(
            HttpServletRequest httpRequest,
            @RequestBody CheckInActivityRequest checkInRequest) {
        Object currentUserId = httpRequest.getAttribute("currentUserId");
        if(currentUserId instanceof Integer){
            Integer userNum = (Integer) currentUserId;
            checkInRequest.setUserId(userNum);
            CheckInActivityResponse response = activityServer.checkInActivity(checkInRequest);
            return ResponseEntity.ok(response);
        }else{
            String errorMsg = "用户ID类型错误，期望Integer，实际类型: " +
                    (currentUserId != null ? currentUserId.getClass().getSimpleName() : "null");
            return ResponseEntity.badRequest()
                    .body(new CheckInActivityResponse(checkInRequest,false,errorMsg));
        }
    }

    // ---------------------- 活动聊天室功能 ----------------------

    /**
     * 发送活动聊天消息
     * @param httpRequest HTTP请求对象（用于获取当前用户ID）
     * @param activityId 活动ID
     * @param content 消息内容
     * @return 发送结果
     */
    @PostMapping("/chat/send")
    public ResponseEntity<String> sendActivityChat(
            HttpServletRequest httpRequest,
            @RequestParam Integer activityId,
            @RequestBody String content) {
        Object currentUserId = httpRequest.getAttribute("currentUserId");
        if(currentUserId instanceof Integer){
            Integer userNum = (Integer) currentUserId;
            User sender = userRepository.findById(Integer.valueOf(userNum)).orElseThrow();

            MessageSendDTO messageDTO = new MessageSendDTO(content,
                    Integer.valueOf(userNum),
                    Integer.valueOf(activityId.toString()));
            String result = new MessageServer().sendMessage(messageDTO);
            return ResponseEntity.ok(result);
        }else{
            String errorMsg = "用户ID类型错误，期望Integer，实际类型: " +
                    (currentUserId != null ? currentUserId.getClass().getSimpleName() : "null");
            return ResponseEntity.badRequest()
                    .body(errorMsg);
        }
    }

    /**
     * 获取活动聊天历史
     * @param activityId 活动ID
     * @return 聊天历史结果
     */
    @GetMapping("/chat/history/{activityId}")
    public ResponseEntity<ListMessageHistory> getActivityChatHistory(@PathVariable Integer activityId) {
        MessageHistoryRequest historyRequest = new MessageHistoryRequest();
        historyRequest.setReceiveId(Integer.valueOf(activityId.toString()));
        ListMessageHistory response = new MessageServer().messageHistory(historyRequest);
        return ResponseEntity.ok(response);
    }
}