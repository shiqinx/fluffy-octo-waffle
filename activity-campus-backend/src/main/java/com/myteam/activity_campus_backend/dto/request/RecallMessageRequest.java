package com.myteam.activity_campus_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

/**
 * @author sjy15
 * @description: 撤回消息
 * @date 2025/10/31 00:23
 */
public class RecallMessageRequest {
    @NotBlank(message = "消息内容不为空")
    private String message;
    @NotBlank(message = "操作人不能为空")
    private Integer senderid;
    @NotBlank(message = "接收方不能为空")
    private Integer receiverId;
    private LocalDateTime time;
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public Integer getSenderid() {
        return senderid;
    }
    public void setSenderid(Integer senderid) {
        this.senderid = senderid;
    }
    public Integer getReceiverId() {
        return receiverId;
    }
    public void setReceiverId(Integer receiverId) {
        this.receiverId = receiverId;
    }
    public LocalDateTime getTime() {
        return time;
    }
    public void setTime(LocalDateTime time) {
        this.time = time;
    }
}
