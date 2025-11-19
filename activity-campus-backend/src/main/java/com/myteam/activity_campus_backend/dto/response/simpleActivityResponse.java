package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.dto.ActivityDTO;
import com.myteam.activity_campus_backend.entity.Activity;
import lombok.Getter;
import lombok.Setter;

/**
 *   @author sjy15
 *   @description: 单个活动的信息传递
 *   @date 2025/10/31 15:49
 */
public class simpleActivityResponse {
    private ActivityDTO activitydto;
    @Setter
    @Getter
    private boolean success;
    @Getter
    @Setter
    private String message;
    public simpleActivityResponse(ActivityDTO activitydto, boolean success, String message) {
        this.activitydto=activitydto;
        this.success = success;
        this.message = message;
    }
    public ActivityDTO getActivityDTO() {
        return activitydto;
    }
    public void setActivityDTO(ActivityDTO activitydto) {
        this.activitydto = activitydto;
    }

}
