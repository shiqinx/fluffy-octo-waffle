package com.myteam.activity_campus_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "message", schema = "campus-activity", indexes = {
        @Index(name = "idx_Message_User_Id", columnList = "user_Id")
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
    private com.myteam.activity_campus_backend.entity.User user;

    @NotNull
    @Lob
    @Column(name = "content", nullable = false)
    private String content;

    @NotNull
    @Column(name = "send_Time", nullable = false)
    private LocalDateTime sendTime;

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

    public com.myteam.activity_campus_backend.entity.User getUser() {
        return user;
    }

    public void setUser(com.myteam.activity_campus_backend.entity.User user) {
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