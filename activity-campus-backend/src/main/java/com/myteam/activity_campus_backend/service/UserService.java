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

import java.util.Map;
import java.util.Optional;

import static com.myteam.activity_campus_backend.util.BCryptUtil.encrypt;
import static com.myteam.activity_campus_backend.util.BCryptUtil.matches;

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
    public UserRegisterResponse registration(UserRegisterRequest request){
        try {
            //避免直接返回 null，减少 NullPointerException
            Optional<User> userEntity = userRepository.findById(request.getUserId());//使用repository

            if (userEntity.isPresent()) {//已找到用户id
                User user = userEntity.get();
                //检查用户状态
                if (user.getUserStatus().equals("ACTIVE")) {
                    return new UserRegisterResponse("用户已启用", request.getUserId());
                }
                //检查用户姓名
                if(!user.getUserName().equals(request.getUserName())){
                    return new UserRegisterResponse("用户名错误", request.getUserId());
                }
                //检查用户密码
                if (!matches(request.getUserPassword(), user.getUserPassword())) {
                    return new UserRegisterResponse("密码错误", request.getUserId());
                }
                user.setUserStatus("ACTIVE");
                userRepository.save(user);
                return new UserRegisterResponse("注册成功", request.getUserId());
            } else {
                return new UserRegisterResponse("账号错误", request.getUserId());
            }
        } catch (Exception e) {
            return new UserRegisterResponse("注册系统异常，请重试", request.getUserId());
        }
    }
    public UserLoginResponse login(UserLoginRequest request){
        try{
            Optional<User> userEntity = userRepository.findById(request.getUserId());
            if (userEntity.isPresent()) {
                if(!matches(request.getUserPassword(), userEntity.get().getUserPassword())){
                    return new UserLoginResponse("密码错误",request.getUserId());
                }
                Map<String, Object> data = Map.of(
                        "Id", request.getUserId()
                );
                // 无论是否记住我，都返回刷新令牌，用于无感刷新
                String accessToken = jwtTokenUtil.generateAccessToken(data, request.getUserId());
                String refreshToken = jwtTokenUtil.generateRefreshToken(request.getUserId());

                return new UserLoginResponse("登陆成功", request.getUserId(), accessToken, refreshToken);
            }else{
                return new UserLoginResponse("账号错误",request.getUserId());
            }
        } catch (Exception e) {
            return new UserLoginResponse("登录系统异常，请重试",request.getUserId());
        }
    }
    public ChangePasswordResponse changePassword(ChangePasswordRequest request){
        Optional<User> userEntity = userRepository.findById(request.getUserId());
        if (userEntity.isPresent()) {
            User user = userEntity.get();
            if(!matches(request.getUser_OldPassword(), user.getUserPassword())){
                return new ChangePasswordResponse("密码错误",request.getUserId());
            }
            String EncryptPassword=encrypt(request.getUser_NewPassword());
            user.setUserPassword(EncryptPassword);
            userRepository.save(user);
            return new ChangePasswordResponse("密码修改成功",request.getUserId());
        }else{
            return new ChangePasswordResponse("用户不存在",request.getUserId());
        }
    }

}
