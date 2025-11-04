package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.dto.ActivityDTO;
import com.myteam.activity_campus_backend.entity.Activity;

/**
 *   @author sjy15
 *   @description: 单个活动的信息传递
 *   @date 2025/10/31 15:49
 */
public class simpleActivityResponse {
    private ActivityDTO activity;
    private boolean success;
    private String message;
    public simpleActivityResponse(ActivityDTO activity, boolean success, String message) {
        this.activity=new ActivityDTO();
        this.success = success;
        this.message = message;
    }
    public ActivityDTO getActivity() {
        return activity;
    }
    public void setActivity(ActivityDTO activity) {
        this.activity = activity;
    }
    public boolean isSuccess() {
        return success;
    }
    public void setSuccess(boolean success) {
        this.success = success;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}
