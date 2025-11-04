package com.myteam.activity_campus_backend.dto;

import com.myteam.activity_campus_backend.entity.Team;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.repository.UserRepository;

import java.util.Optional;

/**
 * @author sjy15
 * @description: 团队DTO
 * @date 2025/11/2 02:28
 */
public class TeamDTO {
    private Integer id;
    private String teamName;
    private UserDTO user;
    private static UserRepository userRepository;
    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }
    public String getTeamName() {
        return teamName;
    }
    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }
    public UserDTO getUser() {
        return user;
    }
    public void setUser(UserDTO user) {
        this.user = user;
    }
    public static TeamDTO copy(Team team) {
        TeamDTO teamDTO = new TeamDTO();
        teamDTO.setId(team.getId());
        teamDTO.setTeamName(team.getTeamName());
        UserDTO userDTO = new UserDTO();
        userDTO.setUser_id(team.getCreator().getId());
        userDTO.setUsername(team.getCreator().getUserName());
        teamDTO.setUser(userDTO);
        return teamDTO;
    }
    public static Team toTeam(TeamDTO teamDTO) {
        Team team = new Team();
        team.setId(teamDTO.getId());
        team.setTeamName(teamDTO.getTeamName());
        Optional<User> user = Optional.of(new User());
        user=userRepository.findById(teamDTO.getUser().getUser_id());
        team.setCreator(user.get());
        return team;
    }
}
