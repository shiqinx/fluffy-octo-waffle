package com.myteam.activity_campus_backend.dto.request;

/**
 * @author sjy15
 * @description: 搜索团队请求
 * @date 2025/11/2 18:34
 */
public class ResearchTeamRequest {
    private String keyword;
    public ResearchTeamRequest(String keyword) {
        this.keyword = keyword;
    }

    public String getKeyword() {
        return keyword;
    }
    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
}
