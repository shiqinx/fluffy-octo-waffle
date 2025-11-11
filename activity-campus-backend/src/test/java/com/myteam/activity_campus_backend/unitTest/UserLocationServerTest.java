package com.myteam.activity_campus_backend.unitTest;

import com.myteam.activity_campus_backend.dto.request.userLocationRequest;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.repository.UserRepository;
import com.myteam.activity_campus_backend.repository.UserlocationRepository;
import com.myteam.activity_campus_backend.service.UserLocationServer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.mockito.Mockito.*;


/**
 * @author sjy15
 * @description: 用户实时位置服务类单元测试
 * @date 2025/11/10 02:29
 */
@ExtendWith(MockitoExtension.class)
public class UserLocationServerTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserlocationRepository userlocationRepository;
    @InjectMocks
    private UserLocationServer userLocationServer;
    //用户不存在，不保存位置信息
    @Test
    void save_UserNotFound_NotSave(){
        Integer userId = 12345;
        userLocationRequest request=new userLocationRequest();
        request.setUserId(userId);
        request.setLatitude(new BigDecimal("30.12345"));
        request.setLongitude(new BigDecimal("120.54321"));
        request.setValidTime(Instant.now().plusSeconds(3600).toEpochMilli());//1小时后过期
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        userLocationServer.save(request);
        verify(userlocationRepository,never()).save(any());
    }
    //用户存在但位置过期
    @Test
    void save_TimeExpired_NotSave(){
        Integer userId = 12345;
        User user = new User();
        user.setId(userId);
        userLocationRequest request=new userLocationRequest();
        request.setUserId(userId);
        request.setLatitude(new BigDecimal("30.12345"));
        request.setLongitude(new BigDecimal("120.54321"));
        //过期时间设为当前小时的1小时前
        request.setValidTime(Instant.now().minusSeconds(3600).toEpochMilli());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        userLocationServer.save(request);
        verify(userlocationRepository,never()).save(any());
    }
    //用户存在且信息未过期，保存
    @Test
    void save_OK_Save(){
        Integer userId = 12345;
        User user = new User();
        user.setId(userId);
        long validTime = Instant.now().plusSeconds(3600).toEpochMilli();
        userLocationRequest request=new userLocationRequest();
        request.setUserId(userId);
        request.setLatitude(new BigDecimal("30.12345"));
        request.setLongitude(new BigDecimal("120.54321"));
        request.setValidTime(validTime);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        userLocationServer.save(request);
        verify(userlocationRepository,times(1)).save(argThat(location -> {
            // 检查保存的位置信息是否正确关联用户、经纬度和有效期
            return location.getUser().getId().equals(userId)
                    && location.getLatitude().equals(new BigDecimal("30.12345"))
                    && location.getLongitude().equals(new BigDecimal("120.54321"))
                    && location.getValidTime().equals(validTime);
        }));
    }
}
