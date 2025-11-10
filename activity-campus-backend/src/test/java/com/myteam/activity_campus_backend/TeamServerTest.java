package com.myteam.activity_campus_backend;

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
import com.myteam.activity_campus_backend.service.TeamServer;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.util.AssertionErrors.assertNull;

/**
 * @author sjy15
 * @description: 团队测试
 * @date 2025/11/10 14:41
 */
@ExtendWith(MockitoExtension.class)
public class TeamServerTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private BelongRepository belongRepository;
    @InjectMocks
    private TeamServer teamServer;
    //----------------createTeam方法测试---------------
    //用户不存在时
    @Test
    void createTeam_UserNotFound() {
        TeamCreateRequest team = new TeamCreateRequest();
        team.setUserId(12345);
        team.setTeamName("Team Name");
        when(userRepository.findById(12345)).thenReturn(Optional.empty());
        TeamCreateResponse response = teamServer.createTeam(team);
        assertFalse(response.isSuccess());
        Assertions.assertNull(response.getTeam());
        verify(teamRepository,never()).save(any(Team.class));
    }
    //用户存在，保存成功
    @Test
    void createTeam_OK() {
        TeamCreateRequest team = new TeamCreateRequest();
        team.setUserId(12345);
        team.setTeamName("Team Name");
        User user=new User();
        user.setId(12345);
        user.setUserName("user");
        when(userRepository.findById(12345)).thenReturn(Optional.of(user));
        when(teamRepository.findIdByTeamName("Team Name")).thenReturn(Optional.of(100));
        TeamCreateResponse response = teamServer.createTeam(team);
        assertTrue(response.isSuccess());
        assertNotNull(response.getTeam());
        assertEquals(100,response.getTeam().getId());
        assertEquals("Team Name",response.getTeam().getTeamName());
        assertEquals(12345,response.getTeam().getUser().getUser_id());
        verify(teamRepository,times(1)).save(any(Team.class));
    }
    //----------------belongTeam方法测试:团队报名发送给团队主理人---------------
    //用户不存在
    @Test
    void belongTeam_UserNotFound() {
        BelongTeamRequest request = new BelongTeamRequest();
        request.setUserId(12345);
        request.setTeamId(100);
        when(userRepository.findById(12345)).thenReturn(Optional.empty());
        BelongTeamResponse response = teamServer.belongTeam(request);
        Assertions.assertNull(response.getBelong());
        assertEquals("用户不存在",response.getMessage());
    }
    //团队不存在
    @Test
    void belongTeam_TeamNotFound() {
        BelongTeamRequest request = new BelongTeamRequest();
        request.setUserId(12345);
        request.setTeamId(100);
        User user=new User();
        user.setId(12345);
        user.setUserName("user");
        when(userRepository.findById(12345)).thenReturn(Optional.of(user));
        when(teamRepository.findById(100)).thenReturn(Optional.empty());
        BelongTeamResponse response = teamServer.belongTeam(request);
        Assertions.assertNull(response.getBelong());
        assertEquals("团队不存在",response.getMessage());
    }
    @Test
    void belongTeam_OK() {
        BelongTeamRequest request = new BelongTeamRequest();
        request.setUserId(12345);
        request.setTeamId(100);
        User user=new User();
        user.setId(12345);
        user.setUserName("user");
        Team team=new Team();
        team.setId(100);
        team.setTeamName("Team Name");
        team.setCreator(user);
        when(userRepository.findById(12345)).thenReturn(Optional.of(user));
        when(teamRepository.findById(100)).thenReturn(Optional.of(team));
        BelongTeamResponse response = teamServer.belongTeam(request);
        assertNotNull(response.getBelong());
        assertEquals("团队报名",response.getMessage());
        assertEquals(12345,response.getBelong().getUser().getUser_id());
        assertEquals(100,response.getBelong().getTeamdto().getId());
    }
    //----------------agreeTeam方法测试:同意团队报名申请---------------
    //用户不存在
    @Test
    void agreeTeam_UserNotFound() {
        //  准备测试数据
        UserDTO userDTO=new UserDTO();
        userDTO.setUser_id(12345);
        userDTO.setUsername("user");
        TeamDTO teamDTO=new TeamDTO();
        teamDTO.setId(100);
        teamDTO.setTeamName("Team Name");
        BelongDTO belongDTO=new BelongDTO();
        belongDTO.setUser(userDTO);
        belongDTO.setTeamdto(teamDTO);
        BelongTeamResponse agreement=new BelongTeamResponse(belongDTO,"团队报名");
        //模拟查询结果
        when(userRepository.findById(12345)).thenReturn(Optional.empty());
        BelongTeamResponse result=teamServer.agreeTeam(agreement);
        assertEquals(belongDTO,result.getBelong());
        assertEquals("用户不存在",result.getMessage());
    }
    //团队不存在
    @Test
    void agreeTeam_TeamNotFound() {
        //  准备测试数据
        UserDTO userDTO=new UserDTO();
        userDTO.setUser_id(12345);
        userDTO.setUsername("user");
        TeamDTO teamDTO=new TeamDTO();
        teamDTO.setId(100);
        teamDTO.setTeamName("Team Name");
        BelongDTO belongDTO=new BelongDTO();
        belongDTO.setUser(userDTO);
        belongDTO.setTeamdto(teamDTO);
        BelongTeamResponse agreement=new BelongTeamResponse(belongDTO,"团队报名");
        //查询结果
        User user=new User();
        user.setId(12345);
        user.setUserName("user");
        //模拟查询结果
        when(userRepository.findById(12345)).thenReturn(Optional.of(user));
        when(teamRepository.findById(100)).thenReturn(Optional.empty());
        BelongTeamResponse result=teamServer.agreeTeam(agreement);
        assertEquals(belongDTO,result.getBelong());
        assertEquals("团队不存在",result.getMessage());
    }
    @Test
    void agreeTeam_OK() {
        //  准备测试数据
        UserDTO userDTO=new UserDTO();
        userDTO.setUser_id(12345);
        userDTO.setUsername("user");
        TeamDTO teamDTO=new TeamDTO();
        teamDTO.setId(100);
        teamDTO.setTeamName("Team Name");
        BelongDTO belongDTO=new BelongDTO();
        belongDTO.setUser(userDTO);
        belongDTO.setTeamdto(teamDTO);
        BelongTeamResponse agreement=new BelongTeamResponse(belongDTO,"团队报名");
        //查询结果
        User user=new User();
        user.setId(12345);
        user.setUserName("user");
        Team team=new Team();
        team.setId(100);
        team.setTeamName("Team Name");
        //模拟查询结果
        when(userRepository.findById(12345)).thenReturn(Optional.of(user));
        when(teamRepository.findById(100)).thenReturn(Optional.of(team));
        BelongTeamResponse result=teamServer.agreeTeam(agreement);
        assertEquals(belongDTO,result.getBelong());
        assertEquals("同意",result.getMessage());
        assertEquals(12345,result.getBelong().getUser().getUser_id());
        assertEquals(100,result.getBelong().getTeamdto().getId());
        verify(belongRepository,times(1)).save(any(Belong.class));
    }
    //----------------listResearchTeam方法测试:同意团队报名申请---------------
    //找到0条记录
    @Test
    void listResearchTeam_zeroRecord(){
        ResearchTeamRequest request=new ResearchTeamRequest("不存在");
        when(teamRepository.findByCreator_IdLikeOrIdLikeOrTeamNameLike("不存在")).thenReturn(null);
        ResearchTeamResponse response = teamServer.listResearchTeam(request);
        Assertions.assertNull(response.getTeams());
        assertEquals("找到0条记录",response.getMessage());
    }
    //找到2条记录
    @Test
    void listResearchTeam_twoRecord(){
        ResearchTeamRequest request=new ResearchTeamRequest("test");
        User u=new User();
        u.setId(12345);
        u.setUserName("user");
        Team team_one=new Team();
        team_one.setId(100);
        team_one.setTeamName("Team test_one");
        team_one.setCreator(u);
        Team team_two=new Team();
        team_two.setId(120);
        team_two.setTeamName("Team test_two");
        team_two.setCreator(u);
        List<Team> teams=new ArrayList<>();
        teams.add(team_one);
        teams.add(team_two);
        when(teamRepository.findByCreator_IdLikeOrIdLikeOrTeamNameLike(request.getKeyword())).thenReturn(teams);
        ResearchTeamResponse response = teamServer.listResearchTeam(request);
        assertNotNull(response.getTeams());
        assertEquals(2, response.getTeams().size());
        assertEquals("找到2条记录",response.getMessage());
    }
}
