package com.myteam.activity_campus_backend.controller;

import com.myteam.activity_campus_backend.dto.MessageSendDTO;
import com.myteam.activity_campus_backend.dto.request.ListMessageHistory;
import com.myteam.activity_campus_backend.dto.request.MessageHistoryRequest;
import com.myteam.activity_campus_backend.dto.request.RecallMessageRequest;
import com.myteam.activity_campus_backend.service.MessageServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author sjy15
 * @description: 消息控制层（通用消息，与活动聊天互补）
 * @date 2025/11/3 02:22
 */
@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageServer messageServer;

    /**
     * 撤回消息接口
     * @param recall 撤回消息请求参数（包含消息内容、发送者ID、接收者ID、发送时间）
     * @return 撤回结果响应
     */
    @PostMapping("/recall")
    public ResponseEntity<String> recallMessage(@RequestBody RecallMessageRequest recall) {
        try {
            String result = messageServer.recallMessage(recall);
            return ResponseEntity.ok(result); // 成功返回结果
        } catch (Exception e) {
            // 捕获服务层可能抛出的异常（如参数无效、权限不足等）
            return ResponseEntity.badRequest().body("撤回失败：" + e.getMessage());
        }
    }

    /**
     * 发送消息接口
     * @param messageSendDTO 发送消息请求参数（包含发送者ID、接收者ID、消息内容等）
     * @return 发送结果响应
     */
    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(@RequestBody MessageSendDTO messageSendDTO) {
        try {
            String result = messageServer.sendMessage(messageSendDTO);
            return ResponseEntity.ok(result); // 成功返回结果
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("发送失败：" + e.getMessage());
        }
    }

    /**
     * 查看个人消息历史（非活动专属）
     * @param receiverId 接收者ID（个人用户ID，区别于活动ID）
     * @return 个人消息历史结果
     */
    @GetMapping("/history")
    public ResponseEntity<ListMessageHistory> getPersonalMessageHistory(
            @RequestParam String receiverId) {
        // 修正命名重复：用historyRequest明确语义，避免与其他参数冲突
        MessageHistoryRequest historyRequest = new MessageHistoryRequest();
        historyRequest.setReceiveId(Integer.valueOf(receiverId));
        ListMessageHistory messageHistory = messageServer.messageHistory(historyRequest);
        return ResponseEntity.ok(messageHistory);
    }

    // （补充）查看活动消息历史（与个人消息区分，保持接口语义清晰）
    @GetMapping("/activity/history/{activityId}")
    public ResponseEntity<ListMessageHistory> getActivityMessageHistory(
            @PathVariable String activityId) {
        MessageHistoryRequest historyRequest = new MessageHistoryRequest();
        historyRequest.setReceiveId(Integer.valueOf(activityId)); // 活动消息用活动ID作为接收者ID
        ListMessageHistory messageHistory = messageServer.messageHistory(historyRequest);
        return ResponseEntity.ok(messageHistory);
    }
}
