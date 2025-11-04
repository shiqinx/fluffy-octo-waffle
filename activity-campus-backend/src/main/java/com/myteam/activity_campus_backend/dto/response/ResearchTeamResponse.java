package com.myteam.activity_campus_backend.dto.response;

import com.myteam.activity_campus_backend.dto.TeamDTO;
import com.myteam.activity_campus_backend.dto.UserDTO;

import java.util.List;

/**
 * @author sjy15
 * @description: 搜索团队响应
 * @date 2025/11/2 18:35
 */
public class ResearchTeamResponse {
    private List<TeamDTO> teams;
    public ResearchTeamResponse(List<TeamDTO> teams) {
        this.teams = teams;
    }
    public List<TeamDTO> getTeams() {
        return teams;
    }
    public void setTeams(List<TeamDTO> teams) {
        this.teams = teams;
    }
}
