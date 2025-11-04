package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.dto.PartiDTO;

import java.util.List;

/**
 * @author sjy15
 * @description: 用户参加活动响应
 * @date 2025/11/2 22:40
 */
public class UserPartActivityResponse {
    private List<PartiDTO> PartiList;
    public UserPartActivityResponse(List<PartiDTO> PartiList) {
        this.PartiList=PartiList;
    }
    public List<PartiDTO> getPartiList() {
        return PartiList;
    }
    public void setPartiList(List<PartiDTO> PartiList) {
        this.PartiList = PartiList;
    }
}
