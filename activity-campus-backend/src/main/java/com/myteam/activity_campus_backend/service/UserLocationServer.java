package com.myteam.activity_campus_backend.service;

import com.myteam.activity_campus_backend.dto.request.userLocationRequest;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.entity.Userlocation;
import com.myteam.activity_campus_backend.repository.UserRepository;
import com.myteam.activity_campus_backend.repository.UserlocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * @author sjy15
 * @description:用户实时位置存入数据库
 * @date 2025/11/3 14:43
 */
@Service
public class UserLocationServer {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserlocationRepository userlocationRepository;
    public void save(userLocationRequest ulRequest) {
        User user = userRepository.findById(ulRequest.getUserId()).orElse(null);
        if (user == null) {
            return;
        }
        Userlocation userlocation = new Userlocation();
        userlocation.setUser(user);
        userlocation.setLatitude(ulRequest.getLatitude());
        userlocation.setLongitude(ulRequest.getLongitude());
        Long currentTime = Instant.now().toEpochMilli();
        if (ulRequest.getValidTime() <currentTime) {
            // 过期
            return;
        }
        userlocation.setValidTime(ulRequest.getValidTime());
        userlocationRepository.save(userlocation);
    }
}
