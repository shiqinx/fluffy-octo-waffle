package com.myteam.activity_campus_backend.service;
import com.myteam.activity_campus_backend.dto.request.ChangePasswordRequest;
import com.myteam.activity_campus_backend.dto.response.ChangePasswordResponse;
import com.myteam.activity_campus_backend.util.JWTTokenUtil;
import com.myteam.activity_campus_backend.dto.request.UserLoginRequest;
import com.myteam.activity_campus_backend.dto.request.UserRegisterRequest;
import com.myteam.activity_campus_backend.dto.response.UserLoginResponse;
import com.myteam.activity_campus_backend.dto.response.UserRegisterResponse;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;


/**
 * @author sjy15
 * @description: 注册业务类
 * @date 2025/10/28 14:01
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTTokenUtil jwtTokenUtil;

    @Autowired
    private PasswordService passwordService;

    /**
     * 用户激活/注册（实际是激活已存在用户）
     */
    public UserRegisterResponse registration(UserRegisterRequest request) {

            Optional<User> userEntity = userRepository.findById(request.getUserId());

            if (userEntity.isPresent()) {
                User user = userEntity.get();

                // 检查用户状态
                if ("ACTIVE".equals(user.getUserStatus())) {
                    return new UserRegisterResponse("用户已启用", request.getUserId());
                }

                // 检查用户姓名
                if (!user.getUserName().equals(request.getUserName())) {
                    return new UserRegisterResponse("用户名错误", request.getUserId());
                }

                // 检查用户密码
                if (!passwordService.matches(request.getUserPassword(), user.getUserPassword())) {
                    return new UserRegisterResponse("密码错误", request.getUserId());
                }

                // 激活用户
                user.setUserStatus("ACTIVE");
                userRepository.save(user);
                return new UserRegisterResponse("激活成功", request.getUserId());

            } else {
                return new UserRegisterResponse("账号不存在", request.getUserId());
            }

    }

    /**
     * 用户登录
     */
    public UserLoginResponse login(UserLoginRequest request) {

            Optional<User> userEntity = userRepository.findById(request.getUserId());

            if (userEntity.isPresent()) {
                User user = userEntity.get();

                // 检查用户状态
                if (!"ACTIVE".equals(user.getUserStatus())) {
                    return new UserLoginResponse("用户未激活", request.getUserId());
                }

                // 检查密码
                if (!passwordService.matches(request.getUserPassword(), user.getUserPassword())) {
                    return new UserLoginResponse("密码错误", request.getUserId());
                }

                // 准备JWT声明
                Map<String, Object> claims = new HashMap<>();
                claims.put("userId", request.getUserId());
                claims.put("username", user.getUserName());


                // 生成令牌（使用rememberMe参数）
                String accessToken = jwtTokenUtil.generateAccessToken(request.getUserId(), claims);
                String refreshToken = jwtTokenUtil.generateRefreshToken(request.getUserId(), request.isRememberMe());

                return new UserLoginResponse("登录成功", request.getUserId(), accessToken, refreshToken);

            } else {
                return new UserLoginResponse("账号不存在", request.getUserId());
            }

    }

    /**
     * 修改密码
     */
    public ChangePasswordResponse changePassword(ChangePasswordRequest request) {

            Optional<User> userEntity = userRepository.findById(request.getUserId());

            if (userEntity.isPresent()) {
                User user = userEntity.get();

                // 检查用户状态
                if (!"ACTIVE".equals(user.getUserStatus())) {
                    return new ChangePasswordResponse("用户未激活", request.getUserId());
                }

                // 验证旧密码
                if (!passwordService.matches(request.getUser_OldPassword(), user.getUserPassword())) {
                    return new ChangePasswordResponse("原密码错误", request.getUserId());
                }

                // 更新密码
                String encryptedPassword = passwordService.encrypt(request.getUser_NewPassword());
                user.setUserPassword(encryptedPassword);
                userRepository.save(user);

                return new ChangePasswordResponse("密码修改成功", request.getUserId());

            } else {
                return new ChangePasswordResponse("用户不存在", request.getUserId());
            }
    }
}