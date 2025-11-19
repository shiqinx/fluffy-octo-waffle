package com.myteam.activity_campus_backend.unitTest;

import com.myteam.activity_campus_backend.dto.BelongDTO;
import com.myteam.activity_campus_backend.dto.request.UserBelongRequest;
import com.myteam.activity_campus_backend.dto.response.UserBelongResponse;
import com.myteam.activity_campus_backend.entity.Belong;
import com.myteam.activity_campus_backend.entity.Team;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.repository.BelongRepository;
import com.myteam.activity_campus_backend.service.BelongServer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * @author sjy15
 * @description: 用户属于团队测试
 * @date 2025/11/11 01:41
 */
@ExtendWith(MockitoExtension.class)
public class BelongServerTest {
    @Mock
    private BelongRepository belongRepository;
    @InjectMocks
    private BelongServer belongServer;
    //------------------getUserBelong方法；用户找参与团队---------------
    //找不到
    @Test
    void getUserBelong_None(){
        Integer userId = 1;
        UserBelongRequest request = new UserBelongRequest();
        request.setUserId(userId);
        when(belongRepository.findByUser_IdOrTeam_Id(userId)).thenReturn(new ArrayList<>());
        UserBelongResponse response = belongServer.getUserBelong(request);
        assertNotNull(response);
        assertNotNull(response.getBelongs());
        assertTrue(response.getBelongs().isEmpty()); // 列表为空
    }
    //找到2条记录
    @Test
    void getUserBelong_Two(){
        Integer userId = 1;
        Integer teamId1 = 11;
        Integer teamId2 = 12;
        LocalDateTime time = LocalDateTime.now();
        UserBelongRequest request = new UserBelongRequest();
        request.setUserId(userId);

        User user = new User();
        user.setId(userId);
        user.setUserName("user");
        Team team1 = new Team();
        team1.setId(teamId1);
        team1.setTeamName("team1");
        team1.setCreator(user);
        Team team2 = new Team();
        team2.setId(teamId2);
        team2.setTeamName("team2");
        team2.setCreator(user);

        Belong belong1 = new Belong();
        belong1.setId(22);
        belong1.setUser(user);
        belong1.setTeam(team1);
        belong1.setJoinTime(time);
        Belong belong2 = new Belong();
        belong2.setId(23);
        belong2.setUser(user);
        belong2.setTeam(team2);
        belong2.setJoinTime(time);

        List<Belong> belongs = new ArrayList<>();
        belongs.add(belong1);
        belongs.add(belong2);

        when(belongRepository.findByUser_IdOrTeam_Id(userId)).thenReturn(belongs);
        UserBelongResponse response = belongServer.getUserBelong(request);

        assertNotNull(response);
        assertNotNull(response.getBelongs());
        assertEquals(2, response.getBelongs().size());

        BelongDTO dto1 = response.getBelongs().get(0);
        BelongDTO dto2 = response.getBelongs().get(1);
        assertNotNull(dto1);
        assertNotNull(dto2);
        assertEquals(1,dto1.getUser().getUser_id());
        assertEquals(11,dto1.getTeamdto().getId());
        assertEquals(1,dto2.getUser().getUser_id());
        assertEquals(12,dto2.getTeamdto().getId());
    }
    //------------------listBelongs方法；团队找成员---------------
    //找不到
    @Test
    void listBelongs_None(){
        Integer teamId = 1;
        when(belongRepository.findByUser_IdOrTeam_Id(teamId)).thenReturn(new ArrayList<>());
        List<BelongDTO> belongs = belongServer.listBelongs(teamId);
        assertNotNull(belongs);
        assertTrue(belongs.isEmpty()); // 列表为空
    }
    //找到2条记录
    @Test
    void listBelongs_Two(){
        Integer teamId = 1;
        Integer userId1 = 11;
        Integer userId2 = 12;
        LocalDateTime time = LocalDateTime.now();

        User user1 = new User();
        user1.setId(userId1);
        user1.setUserName("user1");
        User user2 = new User();
        user2.setId(userId2);
        user2.setUserName("user2");
        Team team = new Team();
        team.setId(teamId);
        team.setTeamName("team");
        team.setCreator(user1);

        Belong belong1 = new Belong();
        belong1.setId(21);
        belong1.setUser(user1);
        belong1.setTeam(team);
        belong1.setJoinTime(time);
        Belong belong2 = new Belong();
        belong2.setId(22);
        belong2.setUser(user2);
        belong2.setTeam(team);
        belong2.setJoinTime(time);

        List<Belong> belongs = new ArrayList<>();
        belongs.add(belong1);
        belongs.add(belong2);

        when(belongRepository.findByUser_IdOrTeam_Id(teamId)).thenReturn(belongs);
        List<BelongDTO> result = belongServer.listBelongs(teamId);
        assertNotNull(result);
        assertEquals(2, result.size());
        BelongDTO dto1 = result.get(0);
        BelongDTO dto2 = result.get(1);
        assertNotNull(dto1);
        assertNotNull(dto2);
        assertEquals(11,dto1.getUser().getUser_id());
        assertEquals(1,dto1.getTeamdto().getId());
        assertEquals(12,dto2.getUser().getUser_id());
        assertEquals(1,dto2.getTeamdto().getId());
    }
}
