package com.myteam.activity_campus_backend.dto;

import com.myteam.activity_campus_backend.entity.Belong;

import java.time.Instant;

/**
 * @author sjy15
 * @description: 隶属
 * @date 2025/11/2 03:02
 */
public class BelongDTO {
    private TeamDTO teamdto;
    private UserDTO user;
    public TeamDTO getTeamdto() {
        return teamdto;
    }
    public void setTeamdto(TeamDTO teamdto) {
        this.teamdto = teamdto;
    }
    public UserDTO getUser() {
        return user;
    }
    public void setUser(UserDTO user) {
        this.user = user;
    }
    public static BelongDTO toBelongDTO(Belong belong) {
        UserDTO userDTO = new UserDTO();
        userDTO.setUser_id(belong.getUser().getId());
        userDTO.setUsername(belong.getUser().getUserName());
        TeamDTO teamDTO = new TeamDTO();
        teamDTO=TeamDTO.copy(belong.getTeam());
        BelongDTO belongDTO = new BelongDTO();
        belongDTO.setTeamdto(teamDTO);
        belongDTO.setUser(userDTO);
        return belongDTO;
    }
}
