package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.dto.BelongDTO;

import java.util.List;

/**
 * @author sjy15
 * @description: 用户参与团队列表
 * @date 2025/11/2 23:46
 */
public class UserBelongResponse {
    private List<BelongDTO> belongs;
    public UserBelongResponse(List<BelongDTO> belongs) {
        this.belongs=belongs;
    }
    public List<BelongDTO> getBelongs() {
        return belongs;
    }
    public void setBelongs(List<BelongDTO> belongs) {
        this.belongs = belongs;
    }
}
