package com.myteam.activity_campus_backend.service;

import com.myteam.activity_campus_backend.dto.BelongDTO;
import com.myteam.activity_campus_backend.dto.TeamDTO;
import com.myteam.activity_campus_backend.dto.UserDTO;
import com.myteam.activity_campus_backend.dto.request.BelongTeamRequest;
import com.myteam.activity_campus_backend.dto.request.ResearchTeamRequest;
import com.myteam.activity_campus_backend.dto.request.TeamCreateRequest;
import com.myteam.activity_campus_backend.dto.response.BelongTeamResponse;
import com.myteam.activity_campus_backend.dto.response.ResearchTeamResponse;
import com.myteam.activity_campus_backend.dto.response.TeamCreateResponse;
import com.myteam.activity_campus_backend.entity.Belong;
import com.myteam.activity_campus_backend.entity.Team;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.repository.BelongRepository;
import com.myteam.activity_campus_backend.repository.TeamRepository;
import com.myteam.activity_campus_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author sjy15
 * @description: 团队业务
 * @date 2025/11/2 02:27
 */
@Service
public class TeamServer {
    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BelongRepository belongRepository;
    //创建团队
    public TeamCreateResponse createTeam(TeamCreateRequest team) {
        User user = userRepository.findById(team.getUserId()).orElse(null);
        if (user == null) {
            return new TeamCreateResponse(null,false);
        }
        Team teamEntity = new Team();
        teamEntity.setTeamName(team.getTeamName());
        teamEntity.setCreator(user);
        teamRepository.save(teamEntity);
        UserDTO userDTO = new UserDTO();
        userDTO.setUser_id(user.getId());
        userDTO.setUsername(user.getUserName());
        Integer teamId = teamRepository.findIdByTeamName(team.getTeamName()).get();
        TeamDTO teamDTO = new TeamDTO();
        teamDTO.setId(teamId);
        teamDTO.setTeamName(team.getTeamName());
        teamDTO.setUser(userDTO);
        return new TeamCreateResponse(teamDTO,true);
    }
    //团队报名发送给团队主理人
    public BelongTeamResponse belongTeam(BelongTeamRequest teamrequest) {
        User user = userRepository.findById(teamrequest.getUserId()).orElse(null);
        Team team= teamRepository.findById(teamrequest.getTeamId()).get();
        if(user == null||team == null) {
            return new BelongTeamResponse(null,"用户或团队出错");
        }
        UserDTO userDTO = new UserDTO();
        userDTO.setUser_id(user.getId());
        userDTO.setUsername(user.getUserName());
        TeamDTO teamDTO = new TeamDTO();
        teamDTO.copy(team);
        BelongDTO belongDTO = new BelongDTO();
        belongDTO.setTeamdto(teamDTO);
        belongDTO.setUser(userDTO);
        return new BelongTeamResponse(belongDTO,"团队报名");
    }
    //同意团队报名申请
    public BelongTeamResponse agreeTeam(BelongTeamResponse agreement) {
        agreement.setMessage("同意");
        Belong belong = new Belong();
        Team team=TeamDTO.toTeam(agreement.getBelong().getTeamdto());
        belong.setTeam(team);
        Optional<User> user= Optional.of(new User());
        user=userRepository.findById(agreement.getBelong().getUser().getUser_id());
        User u=user.get();
        belong.setUser(u);
        belong.setJoinTime(LocalDateTime.now());
        belongRepository.save(belong);
        return agreement;
    }
    public ResearchTeamResponse listResearchTeam(ResearchTeamRequest teamrequest) {
        List<Team> teams=new ArrayList<>();
        teams=teamRepository.findByCreator_IdLikeOrIdLikeOrTeamNameLike(teamrequest.getKeyword());
        if(teams==null||teams.size()==0) {
            return new ResearchTeamResponse(null);
        }
        List<TeamDTO> teamDTOList=new ArrayList<>();
        teamDTOList=teams.stream().map(TeamDTO::copy).collect(Collectors.toList());
        return new ResearchTeamResponse(teamDTOList);
    }
}
