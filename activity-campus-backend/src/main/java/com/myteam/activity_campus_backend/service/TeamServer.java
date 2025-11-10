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

import java.time.LocalDateTime;
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
        Optional<User> user1 = userRepository.findById(teamrequest.getUserId());
        if (user1.isEmpty()) {
            return new BelongTeamResponse(null, "用户不存在");
        }
        User user = user1.get();
        Optional<Team> team1= teamRepository.findById(teamrequest.getTeamId());
        if(team1.isEmpty()) {
            return new BelongTeamResponse(null, "团队不存在");
        }
        Team team=team1.get();
        UserDTO userDTO = new UserDTO();
        userDTO.setUser_id(user.getId());
        userDTO.setUsername(user.getUserName());
        TeamDTO teamDTO =TeamDTO.copy(team);
        BelongDTO belongDTO = new BelongDTO();
        belongDTO.setTeamdto(teamDTO);
        belongDTO.setUser(userDTO);
        return new BelongTeamResponse(belongDTO,"团队报名");
    }
    //同意团队报名申请
    public BelongTeamResponse agreeTeam(BelongTeamResponse agreement) {
        Belong belong = new Belong();
        Optional<User> user =userRepository.findById(agreement.getBelong().getUser().getUser_id());
        if(user.isEmpty()) {
            agreement.setMessage("用户不存在");
            return agreement;
        }
        User u=user.get();
        belong.setUser(u);
        Optional<Team> team1=teamRepository.findById(agreement.getBelong().getTeamdto().getId());
        if(team1.isEmpty()) {
            agreement.setMessage("团队不存在");
            return agreement;
        }
        Team team=team1.get();
        belong.setTeam(team);
        belong.setJoinTime(LocalDateTime.now());
        belongRepository.save(belong);
        agreement.setMessage("同意");
        return agreement;
    }
    public ResearchTeamResponse listResearchTeam(ResearchTeamRequest teamrequest) {
        List<Team> teams=teamRepository.findByCreator_IdLikeOrIdLikeOrTeamNameLike(teamrequest.getKeyword());
        if(teams==null|| teams.isEmpty()) {
            return new ResearchTeamResponse("找到0条记录",null);
        }
        List<TeamDTO> teamDTOList=teams.stream().map(TeamDTO::copy).collect(Collectors.toList());
        return new ResearchTeamResponse("找到"+teamDTOList.size()+"条记录",teamDTOList);
    }
}
