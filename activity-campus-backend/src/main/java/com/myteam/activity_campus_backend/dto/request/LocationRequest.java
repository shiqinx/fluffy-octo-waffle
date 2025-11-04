package com.myteam.activity_campus_backend.dto.request;

import com.myteam.activity_campus_backend.entity.Activity;

import java.math.BigDecimal;
import java.util.Set;

/**
 * @author sjy15
 * @description: 地图写入数据库
 * @date 2025/11/3 02:37
 */
public class LocationRequest {
    private String regionName;
    private BigDecimal centerLatitude;
    private BigDecimal centerLongitude;
    private String dministrativeCode;
    private String regionType;
    private String detailAddress;
    private BigDecimal regionRadius;
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
    public BigDecimal getRegionRadius() {
        return regionRadius;
    }
    public void setRegionRadius(BigDecimal regionRadius) {
        this.regionRadius = regionRadius;
    }
}
