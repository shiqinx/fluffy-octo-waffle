package com.myteam.activity_campus_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "belong", schema = "campus-activity", indexes = {
        @Index(name = "idx_Belong_Team_Id", columnList = "team_Id"),
        @Index(name = "idx_Belong_User_Id", columnList = "user_Id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_Belong_Team_User", columnNames = {"team_Id", "user_Id"})
})
public class Belong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_record_Id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_Id", nullable = false)
    private com.myteam.activity_campus_backend.entity.Team team;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_Id", nullable = false)
    private com.myteam.activity_campus_backend.entity.User user;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "join_Time", nullable = false)
    private LocalDateTime joinTime;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public com.myteam.activity_campus_backend.entity.Team getTeam() {
        return team;
    }

    public void setTeam(com.myteam.activity_campus_backend.entity.Team team) {
        this.team = team;
    }

    public com.myteam.activity_campus_backend.entity.User getUser() {
        return user;
    }

    public void setUser(com.myteam.activity_campus_backend.entity.User user) {
        this.user = user;
    }

    public LocalDateTime getJoinTime() {
        return joinTime;
    }

    public void setJoinTime(LocalDateTime joinTime) {
        this.joinTime = joinTime;
    }

}