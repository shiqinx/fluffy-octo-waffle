package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.dto.ActivityDTO;
import com.myteam.activity_campus_backend.dto.UserDTO;
import com.myteam.activity_campus_backend.entity.Activity;


/**
 * @author sjy15
 * @description: 报名请求传递给活动主理人
 * @date 2025/10/31 23:46
 */
public class ParticipateInActivityResponse {
    private UserDTO participant;
    private ActivityDTO activity;
    private String message;
    public ParticipateInActivityResponse(UserDTO participant, ActivityDTO activity, String message) {
        this.participant = participant;
        this.activity = activity;
        this.message = message;
    }
    public UserDTO getParticipant() {
        return participant;
    }
    public void setParticipant(UserDTO participant) {
        this.participant = participant;
    }
    public ActivityDTO getActivity() {
        return activity;
    }
    public void setActivity(ActivityDTO activity) {
        this.activity = activity;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}
