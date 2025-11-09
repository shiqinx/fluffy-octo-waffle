package com.myteam.activity_campus_backend;

import com.myteam.activity_campus_backend.dto.request.UserRegisterRequest;
import com.myteam.activity_campus_backend.dto.response.UserRegisterResponse;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.repository.UserRepository;
import com.myteam.activity_campus_backend.service.UserService;
import com.myteam.activity_campus_backend.util.JWTTokenUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * @author sjy15
 * @description: 用户服务层测试
 * @date 2025/11/6 17:55
 */
@ExtendWith(MockitoExtension.class)
public class UserServerTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private JWTTokenUtil jwtTokenUtil;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks//注入mock
    private UserService userService;
    // ========== registration 方法测试 ==========
    @Test
    void register_cannotfindUser(){
        Integer userId = 12345;
        UserRegisterRequest request=new UserRegisterRequest(userId,"name","password");
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        //when
        UserRegisterResponse response=userService.registration(request);
        //Then
        assertEquals("账号不存在", response.getStatus());
        assertEquals(userId, response.getUserId());
        verify(userRepository).findById(userId);
    }
    @Test
    void register_isActive(){
        Integer userId = 12345;
        User user = new User(userId,"name","password","ACTIVE");
        UserRegisterRequest request=new UserRegisterRequest(userId,"name","password");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        UserRegisterResponse response=userService.registration(request);
        //Then
        assertEquals("用户已启用", response.getStatus());
        assertEquals(userId, response.getUserId());
        verify(userRepository,never()).save(any());
    }
    @Test
    void register_userNameIsWrong(){
        Integer userId = 12345;
        User user = new User(userId,"correctName","password","INACTIVE");
        UserRegisterRequest request=new UserRegisterRequest(userId,"name","password");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        UserRegisterResponse response=userService.registration(request);
        assertEquals("用户名错误", response.getStatus());
        assertEquals(userId, response.getUserId());
    }
    @Test
    void register_userPasswordIsWrong(){
        Integer userId = 12345;
        User user = new User(userId,"name","correctPassword","INACTIVE");
        UserRegisterRequest request=new UserRegisterRequest(userId,"name","password");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        UserRegisterResponse response=userService.registration(request);
        assertEquals("密码错误", response.getStatus());
    }
    @Test
    void register_userIsCorrect(){
        Integer userId = 12345;
        User user = new User(userId,"name","password","INACTIVE");
        UserRegisterRequest request=new UserRegisterRequest(userId,"name","password");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        // 需要确保 BCryptUtil.matches 返回 true
        UserRegisterResponse response=userService.registration(request);
        assertEquals("注册成功", response.getStatus());
        assertEquals("ACTIVE",user.getUserStatus());
        verify(userRepository).save(user);
    }
}
