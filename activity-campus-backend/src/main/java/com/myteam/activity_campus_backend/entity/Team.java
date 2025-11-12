package com.myteam.activity_campus_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "\"team\"", indexes = {
        @Index(name = "idx_Team_Creator_Id", columnList = "creator_Id")
})
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_Id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "team_Name", nullable = false, length = 50)
    private String teamName;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_Id", nullable = false)
    private User creator;

    @OneToMany(mappedBy = "team")
    private Set<Belong> belongs = new LinkedHashSet<>();

    public Team() {
    }
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public com.myteam.activity_campus_backend.entity.User getCreator() {
        return creator;
    }

    public void setCreator(com.myteam.activity_campus_backend.entity.User creator) {
        this.creator = creator;
    }

    public Set<Belong> getBelongs() {
        return belongs;
    }

    public void setBelongs(Set<Belong> belongs) {
        this.belongs = belongs;
    }

}