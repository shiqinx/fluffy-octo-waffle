package com.myteam.activity_campus_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "user", schema = "campus-activity")
public class User {
    @Id
    @Column(name = "user_Id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "user_Name", nullable = false, length = 50)
    private String userName;

    @Size(max = 255)
    @NotNull
    @Column(name = "user_Password", nullable = false, length = 255)
    private String userPassword;

    @Size(max = 20)
    @NotNull
    @Column(name = "user_Status", nullable = false, length = 20)
    private String userStatus;

    @OneToMany(mappedBy = "publisher")
    private Set<Activity> activities = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<Belong> belongs = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<Message> messages = new LinkedHashSet<>();

    @OneToMany(mappedBy = "participant")
    private Set<Participate> participates = new LinkedHashSet<>();

    @OneToMany(mappedBy = "creator")
    private Set<Team> teams = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<com.myteam.activity_campus_backend.entity.Userlocation> userlocations = new LinkedHashSet<>();

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }

    public String getUserStatus() {
        return userStatus;
    }

    public void setUserStatus(String userStatus) {
        this.userStatus = userStatus;
    }

    public Set<Activity> getActivities() {
        return activities;
    }

    public void setActivities(Set<Activity> activities) {
        this.activities = activities;
    }

    public Set<Belong> getBelongs() {
        return belongs;
    }

    public void setBelongs(Set<Belong> belongs) {
        this.belongs = belongs;
    }

    public Set<Message> getMessages() {
        return messages;
    }

    public void setMessages(Set<Message> messages) {
        this.messages = messages;
    }

    public Set<Participate> getParticipates() {
        return participates;
    }

    public void setParticipates(Set<Participate> participates) {
        this.participates = participates;
    }

    public Set<Team> getTeams() {
        return teams;
    }

    public void setTeams(Set<Team> teams) {
        this.teams = teams;
    }

    public Set<com.myteam.activity_campus_backend.entity.Userlocation> getUserlocations() {
        return userlocations;
    }

    public void setUserlocations(Set<com.myteam.activity_campus_backend.entity.Userlocation> userlocations) {
        this.userlocations = userlocations;
    }

}