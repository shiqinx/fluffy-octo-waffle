package com.myteam.activity_campus_backend.dto;

/**
 * @author sjy15
 * @description: 消息发送
 * @date 2025/10/31 23:06
 */
public class MessageSendDTO {
    private String message;
    private Integer senderId;
    private Integer receiverId;
    public MessageSendDTO(String message, Integer senderId, Integer receiverId) {
        this.message = message;
        this.senderId = senderId;
        this.receiverId = receiverId;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public Integer getSenderId() {
        return senderId;
    }
    public void setSenderId(Integer senderId) {
        this.senderId = senderId;
    }
    public Integer getReceiverId() {
        return receiverId;
    }
    public void setReceiverId(Integer receiverId) {
        this.receiverId = receiverId;
    }
}
