package com.myteam.activity_campus_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "participate", schema = "campus-activity", indexes = {
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
    private com.myteam.activity_campus_backend.entity.User participant;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "activity_Id", nullable = false)
    private Activity activity;

    @NotNull
    @Column(name = "time", nullable = false)
    private LocalDateTime time;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public com.myteam.activity_campus_backend.entity.User getParticipant() {
        return participant;
    }

    public void setParticipant(com.myteam.activity_campus_backend.entity.User participant) {
        this.participant = participant;
    }

    public Activity getActivity() {
        return activity;
    }

    public void setActivity(Activity activity) {
        this.activity = activity;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

}