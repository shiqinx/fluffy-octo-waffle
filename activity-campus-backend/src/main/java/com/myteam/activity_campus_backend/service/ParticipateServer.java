package com.myteam.activity_campus_backend.service;

import com.myteam.activity_campus_backend.dto.request.UserPartActivity;
import com.myteam.activity_campus_backend.dto.PartiDTO;
import com.myteam.activity_campus_backend.dto.response.UserPartActivityResponse;
import com.myteam.activity_campus_backend.entity.Participate;
import com.myteam.activity_campus_backend.repository.ParticipateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author sjy15
 * @description: 搜索用户的活动
 * @date 2025/11/2 22:38
 */
@Service
public class ParticipateServer {
    @Autowired
    private ParticipateRepository participateRepository;
    //用户找活动
    public UserPartActivityResponse activityList(UserPartActivity userPartActivity) {
        List<Participate> participates = participateRepository.findByParticipant_IdOrActivity_Id(userPartActivity.getUserId());
        List<PartiDTO> partiDTOs = participates.stream().map(PartiDTO::toDTO).collect(Collectors.toList());
        return new UserPartActivityResponse(partiDTOs);
    }
    //活动找用户
    public List<PartiDTO> list(Integer activityId) {
        List<Participate> participates = participateRepository.findByParticipant_IdOrActivity_Id(activityId);
        List<PartiDTO> partiDTOs = participates.stream().map(PartiDTO::toDTO).collect(Collectors.toList());
        return partiDTOs;
    }
}
