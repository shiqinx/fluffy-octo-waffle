package com.myteam.activity_campus_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "app_participate", indexes = {  // 修正：移除schema，使用双引号
        @Index(name = "idx_Participate_Participant_Id", columnList = "participant_Id"),
        @Index(name = "idx_Participate_Activity_Id", columnList = "activity_Id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_Participate_User_Activity", columnNames = {"participant_Id", "activity_Id"})
})
public class Participate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "part_Id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_Id", nullable = false)
    private User participant;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "activity_Id", nullable = false)
    private Activity activity;

    @NotNull
    @Column(name = "time", nullable = false)
    private LocalDateTime time;

    public Participate() {
    }

}