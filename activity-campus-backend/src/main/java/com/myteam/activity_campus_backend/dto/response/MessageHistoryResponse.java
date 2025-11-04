package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.entity.Message;

import java.time.Instant;
import java.util.List;

/**
 * @author sjy15
 * @description: 查询历史消息
 * @date 2025/10/31 00:26
 */
public class MessageHistoryResponse {
    private Integer receiveId;
    private String senderName;
    private String content;
    private Instant sentAt;
    public MessageHistoryResponse(Integer receiveId, String senderName, String content, Instant sentAt) {
        this.receiveId = receiveId;
        this.senderName = senderName;
        this.content = content;
        this.sentAt = sentAt;
    }
    public Integer getReceiveId() {
        return receiveId;
    }
    public void setReceiveId(Integer receiveId) {
        this.receiveId = receiveId;
    }
    public String getSenderName() {
        return senderName;
    }
    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }
    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public Instant getSentAt() {
        return sentAt;
    }
    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }
}
