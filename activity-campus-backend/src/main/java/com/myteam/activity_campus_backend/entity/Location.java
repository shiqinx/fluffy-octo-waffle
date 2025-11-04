package com.myteam.activity_campus_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "location", schema = "campus-activity")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_Id", nullable = false)
    private Integer id;

    @Size(max = 100)
    @NotNull
    @Column(name = "region_Name", nullable = false, length = 100)
    private String regionName;

    @NotNull
    @Column(name = "center_Latitude", nullable = false, precision = 10, scale = 6)
    private BigDecimal centerLatitude;

    @NotNull
    @Column(name = "center_Longitude", nullable = false, precision = 10, scale = 6)
    private BigDecimal centerLongitude;

    @Size(max = 20)
    @NotNull
    @Column(name = "dministrative_Code", nullable = false, length = 20)
    private String dministrativeCode;

    @Size(max = 50)
    @NotNull
    @Column(name = "region_Type", nullable = false, length = 50)
    private String regionType;

    @Size(max = 500)
    @NotNull
    @Column(name = "detail_Address", nullable = false, length = 500)
    private String detailAddress;

    @NotNull
    @ColumnDefault("1")
    @Column(name = "is_Enabled", nullable = false)
    private Boolean isEnabled = false;

    @NotNull
    @Column(name = "region_Radius", nullable = false, precision = 10, scale = 2)
    private BigDecimal regionRadius;

    @OneToMany(mappedBy = "location")
    private Set<Activity> activities = new LinkedHashSet<>();

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getRegionName() {
        return regionName;
    }

    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }

    public BigDecimal getCenterLatitude() {
        return centerLatitude;
    }

    public void setCenterLatitude(BigDecimal centerLatitude) {
        this.centerLatitude = centerLatitude;
    }

    public BigDecimal getCenterLongitude() {
        return centerLongitude;
    }

    public void setCenterLongitude(BigDecimal centerLongitude) {
        this.centerLongitude = centerLongitude;
    }

    public String getDministrativeCode() {
        return dministrativeCode;
    }

    public void setDministrativeCode(String dministrativeCode) {
        this.dministrativeCode = dministrativeCode;
    }

    public String getRegionType() {
        return regionType;
    }

    public void setRegionType(String regionType) {
        this.regionType = regionType;
    }

    public String getDetailAddress() {
        return detailAddress;
    }

    public void setDetailAddress(String detailAddress) {
        this.detailAddress = detailAddress;
    }

    public Boolean getIsEnabled() {
        return isEnabled;
    }

    public void setIsEnabled(Boolean isEnabled) {
        this.isEnabled = isEnabled;
    }

    public BigDecimal getRegionRadius() {
        return regionRadius;
    }

    public void setRegionRadius(BigDecimal regionRadius) {
        this.regionRadius = regionRadius;
    }

    public Set<Activity> getActivities() {
        return activities;
    }

    public void setActivities(Set<Activity> activities) {
        this.activities = activities;
    }

}