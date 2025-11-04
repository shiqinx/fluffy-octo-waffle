package com.myteam.activity_campus_backend.dto.request;

/**
 *   @author sjy15
 *   @description: 活动列表请求
 *   @date 2025/10/31 16:21
 */
public class ActivityListRequest {
    String keyword;
    public ActivityListRequest(String keyword) {
        this.keyword = keyword;
    }
    public String getKeyword() {
        return keyword;
    }
    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
}
