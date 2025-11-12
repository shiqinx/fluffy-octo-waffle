package com.myteam.activity_campus_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "\"message\"", indexes = {  // 修正：移除schema，使用双引号
        @Index(name = "idx_Message_User_Id", columnList = "user_Id"),
        @Index(name = "idx_Message_Receive_Id", columnList = "receive_Id")
})
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_Id", nullable = false)
    private Integer id;

    @NotNull
    @Column(name = "receive_Id", nullable = false)
    private Integer receiveId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_Id", nullable = false)
    private User user;

    @NotNull
    @Size(max = 255)
    @Column(name = "content", nullable = false, length = 255)
    private String content;

    @NotNull
    @Column(name = "send_Time", nullable = false)
    private LocalDateTime sendTime;

    public Message() {
    }
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getReceiveId() {
        return receiveId;
    }

    public void setReceiveId(Integer receiveId) {
        this.receiveId = receiveId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getSendTime() {
        return sendTime;
    }

    public void setSendTime(LocalDateTime sendTime) {
        this.sendTime = sendTime;
    }

}