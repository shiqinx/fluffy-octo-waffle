package com.myteam.activity_campus_backend.service;

import com.myteam.activity_campus_backend.dto.request.LocationRequest;
import com.myteam.activity_campus_backend.entity.Location;
import com.myteam.activity_campus_backend.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author sjy15
 * @description:地图保存
 * @date 2025/11/3 15:06
 */
@Service
public class LocationServer {
    @Autowired
    private LocationRepository locationRepository;
    public void save(LocationRequest locationRequest) {
        Location location = new Location();
        location.setRegionName(locationRequest.getRegionName());
        location.setCenterLatitude(locationRequest.getCenterLatitude());
        location.setCenterLongitude(locationRequest.getCenterLongitude());
        location.setDministrativeCode(locationRequest.getDministrativeCode());
        location.setRegionType(locationRequest.getRegionType());
        location.setDetailAddress(locationRequest.getDetailAddress());
        location.setRegionRadius(locationRequest.getRegionRadius());
        locationRepository.save(location);
    }
}
