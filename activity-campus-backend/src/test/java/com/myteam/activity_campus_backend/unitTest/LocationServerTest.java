package com.myteam.activity_campus_backend.unitTest;

import com.myteam.activity_campus_backend.dto.request.LocationRequest;
import com.myteam.activity_campus_backend.repository.LocationRepository;
import com.myteam.activity_campus_backend.service.LocationServer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;


/**
 * @author sjy15
 * @description: 地图测试
 * @date 2025/11/11 00:18
 */
@ExtendWith(MockitoExtension.class)
public class LocationServerTest {
    @Mock
    private LocationRepository locationRepository;
    @InjectMocks
    private LocationServer locationServer;
    //保存
    @Test
    void save_OK(){
        LocationRequest locationRequest = new LocationRequest();
        locationRequest.setRegionName("北京市海淀区");
        locationRequest.setCenterLatitude(new BigDecimal("39.997521"));
        locationRequest.setCenterLongitude(new BigDecimal("116.337615"));
        locationRequest.setDministrativeCode("110108");
        locationRequest.setRegionType("district");
        locationRequest.setDetailAddress("中关村大街1号");
        locationRequest.setRegionRadius(new BigDecimal("5000"));
        locationServer.save(locationRequest);
        verify(locationRepository).save(argThat(location ->
                location.getRegionName().equals("北京市海淀区")&&
                        location.getCenterLatitude().equals(new BigDecimal("39.997521"))&&
                        location.getCenterLongitude().equals(new BigDecimal("116.337615"))&&
                        location.getDministrativeCode().equals("110108")&&
                        location.getRegionType().equals("district")&&
                        location.getDetailAddress().equals("中关村大街1号")&&
                        location.getRegionRadius().equals(new BigDecimal("5000"))
                ));

    }
}
