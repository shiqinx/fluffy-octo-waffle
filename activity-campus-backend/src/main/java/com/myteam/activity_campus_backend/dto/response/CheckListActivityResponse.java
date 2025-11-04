package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.dto.ActivityDTO;
import com.myteam.activity_campus_backend.entity.Activity;

import java.util.ArrayList;
import java.util.List;

/**
 * @author sjy15
 * @description: 查询活动列表
 * @date 2025/10/30 21:12
 */
public class CheckListActivityResponse {
    private boolean result;
    private List<ActivityDTO> Activities;
    public CheckListActivityResponse(boolean result, List<ActivityDTO> Activities) {
        this.result = result;
        this.Activities = Activities;
    }
    public boolean isResult() {
        return result;
    }
    public void setResult(boolean result) {
        this.result = result;
    }
    public List<ActivityDTO> getActivities() {
        return Activities;
    }
    public void setActivities(List<ActivityDTO> simpleActivities) {
        this.Activities = simpleActivities;
    }
}
