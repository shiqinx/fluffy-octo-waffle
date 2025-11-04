package com.myteam.activity_campus_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.Set;

@Entity
@Table(name = "activity", schema = "campus-activity", indexes = {
        @Index(name = "idx_Activity_Publisher_Id", columnList = "publisher_Id"),
        @Index(name = "idx_Activity_Location_Id", columnList = "location_Id")
})
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activity_Id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "publisher_Id", nullable = false)
    private User publisher;

    @Size(max = 100)
    @NotNull
    @Column(name = "activity_Name", nullable = false, length = 100)
    private String activityName;

    @Lob
    @Column(name = "activity_Description")
    private String activityDescription;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_Id", nullable = false)
    private com.myteam.activity_campus_backend.entity.Location location;

    @Size(max = 500)
    @NotNull
    @Column(name = "detailed_Address", nullable = false, length = 500)
    private String detailedAddress;

    @NotNull
    @Column(name = "registration_Time", nullable = false)
    private LocalDateTime registrationTime;

    @NotNull
    @Column(name = "registration_End_time", nullable = false)
    private LocalDateTime registrationEndTime;

    @NotNull
    @Column(name = "start_Time", nullable = false)
    private LocalDateTime startTime;

    @NotNull
    @Column(name = "end_Time", nullable = false)
    private LocalDateTime endTime;

    @NotNull
    @ColumnDefault("1")
    @Column(name = "max_People", nullable = false)
    private Integer maxPeople;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "current_People", nullable = false)
    private Integer currentPeople;

    @OneToMany(mappedBy = "activity")
    private Set<com.myteam.activity_campus_backend.entity.Participate> participates = new LinkedHashSet<>();

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getPublisher() {
        return publisher;
    }

    public void setPublisher(User publisher) {
        this.publisher = publisher;
    }

    public String getActivityName() {
        return activityName;
    }

    public void setActivityName(String activityName) {
        this.activityName = activityName;
    }

    public String getActivityDescription() {
        return activityDescription;
    }

    public void setActivityDescription(String activityDescription) {
        this.activityDescription = activityDescription;
    }

    public com.myteam.activity_campus_backend.entity.Location getLocation() {
        return location;
    }

    public void setLocation(com.myteam.activity_campus_backend.entity.Location location) {
        this.location = location;
    }

    public String getDetailedAddress() {
        return detailedAddress;
    }

    public void setDetailedAddress(String detailedAddress) {
        this.detailedAddress = detailedAddress;
    }

    public LocalDateTime getRegistrationTime() {
        return registrationTime;
    }

    public void setRegistrationTime(LocalDateTime registrationTime) {
        this.registrationTime = registrationTime;
    }

    public LocalDateTime getRegistrationEndTime() {
        return registrationEndTime;
    }

    public void setRegistrationEndTime(LocalDateTime registrationEndTime) {
        this.registrationEndTime = registrationEndTime;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Integer getMaxPeople() {
        return maxPeople;
    }

    public void setMaxPeople(Integer maxPeople) {
        this.maxPeople = maxPeople;
    }

    public Integer getCurrentPeople() {
        return currentPeople;
    }

    public void setCurrentPeople(Integer currentPeople) {
        this.currentPeople = currentPeople;
    }

    public Set<com.myteam.activity_campus_backend.entity.Participate> getParticipates() {
        return participates;
    }

    public void setParticipates(Set<com.myteam.activity_campus_backend.entity.Participate> participates) {
        this.participates = participates;
    }
}