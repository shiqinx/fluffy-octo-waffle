package com.myteam.activity_campus_backend;

import com.myteam.activity_campus_backend.dto.request.ChangePasswordRequest;
import com.myteam.activity_campus_backend.dto.request.UserBelongRequest;
import com.myteam.activity_campus_backend.dto.request.UserLoginRequest;
import com.myteam.activity_campus_backend.dto.request.UserRegisterRequest;
import com.myteam.activity_campus_backend.dto.response.ChangePasswordResponse;
import com.myteam.activity_campus_backend.dto.response.UserLoginResponse;
import com.myteam.activity_campus_backend.dto.response.UserRegisterResponse;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.repository.UserRepository;
import com.myteam.activity_campus_backend.service.PasswordService;
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
    private PasswordService passwordService;
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
        verify(userRepository,never()).save(any());
    }
    @Test
    void register_userPasswordIsWrong(){
        Integer userId = 12345;
        User user = new User(userId,"name","correctPassword","INACTIVE");
        UserRegisterRequest request=new UserRegisterRequest(userId,"name","password");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordService.matches("password", "correctPassword")).thenReturn(false);
        UserRegisterResponse response=userService.registration(request);
        assertEquals("密码错误", response.getStatus());
        assertEquals(userId, response.getUserId());
        verify(userRepository,never()).save(any());
    }
    @Test
    void register_userIsCorrect(){
        Integer userId = 12345;
        User user = new User(userId,"name","password","INACTIVE");
        UserRegisterRequest request=new UserRegisterRequest(userId,"name","password");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(passwordService.matches("password", "password")).thenReturn(true);
        // 需要确保 BCryptUtil.matches 返回 true
        UserRegisterResponse response=userService.registration(request);
        assertEquals("激活成功", response.getStatus());
        assertEquals("ACTIVE",user.getUserStatus());
        verify(userRepository).save(user);
    }
    // ========== login方法测试 ==========
    @Test
    void login_cannotfindUser(){
        Integer userId = 12345;
        UserLoginRequest request=new UserLoginRequest(userId,false,"password");
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        UserLoginResponse response=userService.login(request);
        assertEquals("账号不存在",response.getMessage());
        assertEquals(userId, response.getUserId());
        verify(userRepository).findById(userId);
    }
    @Test
    void login_isINActive(){
        Integer userId = 12345;
        User user = new User(userId,"name","password","INACTIVE");
        UserLoginRequest request=new UserLoginRequest(userId,false,"password");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        UserLoginResponse response=userService.login(request);
        assertEquals("用户未激活", response.getMessage());
        assertEquals(userId, response.getUserId());
        verify(userRepository).findById(userId);
    }
    @Test
    void login_userPasswordIsWrong(){
        Integer userId = 12345;
        User user = new User(userId,"name","correctPassword","ACTIVE");
        UserLoginRequest request=new UserLoginRequest(userId,false,"password");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordService.matches("password", "correctPassword")).thenReturn(false);
        UserLoginResponse response=userService.login(request);
        assertEquals("密码错误", response.getMessage());
        assertEquals(userId, response.getUserId());
        verify(userRepository).findById(userId);
    }
    @Test
    void login_userIsCorrect_notRemember(){
        Integer userId = 12345;
        String accessToken="accessToken";
        String refreshToken="refreshToken";
        User user = new User(userId,"name","password","ACTIVE");
        UserLoginRequest request=new UserLoginRequest(userId,false,"password");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(jwtTokenUtil.generateAccessToken(eq(userId),anyMap())).thenReturn(accessToken);
        when(jwtTokenUtil.generateRefreshToken(eq(userId),eq(false))).thenReturn(refreshToken);
        when(passwordService.matches("password", "password")).thenReturn(true);
        UserLoginResponse response=userService.login(request);
        assertEquals("登录成功",response.getMessage());
        assertEquals(userId, response.getUserId());
        assertEquals(accessToken,response.getToken());
        assertEquals(refreshToken,response.getRefreshToken());
        verify(jwtTokenUtil).generateAccessToken(eq(userId),anyMap());
        verify(jwtTokenUtil).generateRefreshToken(eq(userId),eq(false));
    }
    @Test
    void login_userIsCorrect_Remember(){
        Integer userId = 12345;
        String accessToken="accessToken";
        String refreshToken="refreshToken";
        User user = new User(userId,"name","password","ACTIVE");
        UserLoginRequest request=new UserLoginRequest(userId,true,"password");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(jwtTokenUtil.generateAccessToken(eq(userId),anyMap())).thenReturn(accessToken);
        when(jwtTokenUtil.generateRefreshToken(eq(userId),eq(true))).thenReturn(refreshToken);
        when(passwordService.matches("password", "password")).thenReturn(true);
        UserLoginResponse response=userService.login(request);
        assertEquals("登录成功",response.getMessage());
        assertEquals(userId, response.getUserId());
        assertEquals(accessToken,response.getToken());
        assertEquals(refreshToken,response.getRefreshToken());
        verify(jwtTokenUtil).generateAccessToken(eq(userId),anyMap());
        verify(jwtTokenUtil).generateRefreshToken(eq(userId),eq(true));
    }
    // ========== changePassword方法测试 ==========
    @Test
    void changePassword_cannotfindUser(){
        Integer userId = 12345;
        ChangePasswordRequest request=new ChangePasswordRequest(userId,"oldPassword","newPassword");
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        ChangePasswordResponse response=userService.changePassword(request);
        assertEquals("用户不存在",response.getMessage());
        assertEquals(userId, response.getUserId());
        verify(userRepository).findById(userId);
    }
    @Test
    void changePassword_isINActive(){
        Integer userId = 12345;
        User user = new User(userId,"name","password","INACTIVE");
        ChangePasswordRequest request=new ChangePasswordRequest(userId,"oldPassword","newPassword");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        ChangePasswordResponse response=userService.changePassword(request);
        assertEquals("用户未激活",response.getMessage());
        assertEquals(userId, response.getUserId());
        verify(userRepository,never()).save(any());
    }
    @Test
    void changePassword_userPasswordIsWrong(){
        Integer userId = 12345;
        User user = new User(userId,"name","correctPassword","ACTIVE");
        ChangePasswordRequest request=new ChangePasswordRequest(userId,"oldPassword","newPassword");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordService.matches("oldPassword", "correctPassword")).thenReturn(false);
        ChangePasswordResponse response=userService.changePassword(request);
        assertEquals("原密码错误",response.getMessage());
        assertEquals(userId, response.getUserId());
        verify(userRepository, never()).save(any());
    }
    @Test
    void changePassword_userIsCorrect(){
        Integer userId = 12345;
        User user = new User(userId,"name","password","ACTIVE");
        ChangePasswordRequest request=new ChangePasswordRequest(userId,"Password","newPassword");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordService.matches("Password", "password")).thenReturn(true);
        when(passwordService.encrypt("newPassword")).thenReturn("encodedNewPassword");
        ChangePasswordResponse response=userService.changePassword(request);
        assertEquals("密码修改成功",response.getMessage());
        assertEquals(userId, response.getUserId());
        verify(userRepository).save(user);
    }
}
