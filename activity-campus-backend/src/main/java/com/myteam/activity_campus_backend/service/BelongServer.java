package com.myteam.activity_campus_backend.service;

import com.myteam.activity_campus_backend.dto.BelongDTO;
import com.myteam.activity_campus_backend.dto.request.UserBelongRequest;
import com.myteam.activity_campus_backend.dto.response.UserBelongResponse;
import com.myteam.activity_campus_backend.entity.Belong;
import com.myteam.activity_campus_backend.repository.BelongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author sjy15
 * @description: 搜索用户的所属团队
 * @date 2025/11/2 22:37
 */
@Service
public class BelongServer {
    @Autowired
    private BelongRepository belongRepository;
    //用户找参与团队
    public UserBelongResponse getUserBelong(UserBelongRequest userBelongRequest) {
        List<Belong> belongs=belongRepository.findByUser_IdOrTeam_Id(userBelongRequest.getUserId());
        List<BelongDTO> belongDTOS=new ArrayList<>();
        belongDTOS=belongs.stream().map(BelongDTO::toBelongDTO).collect(Collectors.toList());
        return new UserBelongResponse(belongDTOS);
    }
    //团队找成员
    public List<BelongDTO> listBelongs(Integer teamId) {
        List<Belong> belongs=belongRepository.findByUser_IdOrTeam_Id(teamId);
        List<BelongDTO> belongDTOS=new ArrayList<>();
        belongDTOS=belongs.stream().map(BelongDTO::toBelongDTO).collect(Collectors.toList());
        return belongDTOS;
    }
}
