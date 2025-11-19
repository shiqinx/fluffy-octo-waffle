package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.dto.request.CheckInActivityRequest;

/**
 * @author sjy15
 * @description: 签到响应
 * @date 2025/11/1 15:37
 */
public class CheckInActivityResponse {
    private CheckInActivityRequest request;
    private Boolean success;
    private String Msg;
    public CheckInActivityResponse (CheckInActivityRequest request, Boolean success, String msg) {
        this.request = request;
        this.success = success;
        this.Msg = msg;
    }

    public String getMsg() {
        return Msg;
    }
    public void setMsg(String msg) {
        Msg = msg;
    }

    public CheckInActivityRequest getRequest() {
        return request;
    }
    public void setRequest(CheckInActivityRequest request) {
        this.request = request;
    }
    public Boolean getSuccess() {
        return success;
    }
    public void setSuccess(Boolean success) {
        this.success = success;
    }
}
