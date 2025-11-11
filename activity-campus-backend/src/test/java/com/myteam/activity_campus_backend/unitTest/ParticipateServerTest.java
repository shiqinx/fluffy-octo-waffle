package com.myteam.activity_campus_backend.unitTest;

import com.myteam.activity_campus_backend.dto.PartiDTO;
import com.myteam.activity_campus_backend.dto.request.UserPartActivity;
import com.myteam.activity_campus_backend.dto.response.UserPartActivityResponse;
import com.myteam.activity_campus_backend.entity.Activity;
import com.myteam.activity_campus_backend.entity.Location;
import com.myteam.activity_campus_backend.entity.Participate;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.repository.ParticipateRepository;
import com.myteam.activity_campus_backend.service.ParticipateServer;
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
 * @description: 用户参与活动测试
 * @date 2025/11/10 19:18
 */
@ExtendWith(MockitoExtension.class)
public class ParticipateServerTest {
    @Mock
    private ParticipateRepository participateRepository;
    @InjectMocks
    private ParticipateServer participateServer;
    //-------------activityList方法：用户找活动---------------
    //找不到
    @Test
    void activityList_empty() {
        Integer userId = 12345;
        UserPartActivity userPartActivity = new UserPartActivity();
        userPartActivity.setUserId(userId);
        when(participateRepository.findByParticipant_IdOrActivity_Id(userId)).thenReturn(new ArrayList<>());
        UserPartActivityResponse response=participateServer.activityList(userPartActivity);
        assertNotNull(response);
        assertNotNull(response.getPartiList());
        assertTrue(response.getPartiList().isEmpty()); // 列表为空
    }
    //找到1个
    @Test
    void activityList_success() {
        //测试数据
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        User user = new User();
        user.setId(12345);
        user.setUserName("user");
        UserPartActivity userPartActivity = new UserPartActivity();
        userPartActivity.setUserId(12345);
        Location location = new Location();
        location.setId(11);
        Activity activity = new Activity();
        activity.setId(1);
        activity.setActivityName("activity1");
        activity.setActivityDescription("activity-description");
        activity.setPublisher(user);
        activity.setLocation(location);
        activity.setDetailedAddress("detailed-address");
        activity.setRegistrationTime(yesterday);
        activity.setRegistrationEndTime(yesterday);
        activity.setStartTime(yesterday);
        activity.setEndTime(yesterday);
        activity.setMaxPeople(32);
        activity.setCurrentPeople(12);
        Participate participate = new Participate();
        participate.setId(100);
        participate.setActivity(activity);
        participate.setParticipant(user);
        participate.setTime(yesterday);

        List<Participate> participates = new ArrayList<>();
        participates.add(participate);
        //结果
        when(participateRepository.findByParticipant_IdOrActivity_Id(12345)).thenReturn(participates);
        UserPartActivityResponse response=participateServer.activityList(userPartActivity);
        assertNotNull(response);
        assertNotNull(response.getPartiList());
        assertEquals(1,response.getPartiList().size());
        assertEquals(12345,response.getPartiList().get(0).getUser().getUser_id());
        assertEquals(1,response.getPartiList().get(0).getActivity().getId());
        assertEquals(100,response.getPartiList().get(0).getId());
    }
    //-------------list方法：活动找用户---------------
    //找不到
    @Test
    void list_empty() {
        Integer activityId = 1;
        when(participateRepository.findByParticipant_IdOrActivity_Id(activityId)).thenReturn(new ArrayList<>());
        List<PartiDTO> list = participateServer.list(activityId);
        assertNotNull(list);
        assertTrue(list.isEmpty());
    }
    //找到2条
    @Test
    void list_success() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);

        User user_one = new User();
        user_one.setId(12345);
        user_one.setUserName("user_one");
        User user_two = new User();
        user_two.setId(12356);
        user_two.setUserName("user_two");

        Location location = new Location();
        location.setId(11);

        Activity activity = new Activity();
        activity.setId(1);
        activity.setActivityName("activity1");
        activity.setActivityDescription("activity-description");
        activity.setPublisher(user_one);
        activity.setLocation(location);
        activity.setDetailedAddress("detailed-address");
        activity.setRegistrationTime(yesterday);
        activity.setRegistrationEndTime(yesterday);
        activity.setStartTime(yesterday);
        activity.setEndTime(yesterday);
        activity.setMaxPeople(32);
        activity.setCurrentPeople(12);

        Participate participate_one = new Participate();
        participate_one.setId(100);
        participate_one.setActivity(activity);
        participate_one.setParticipant(user_one);
        participate_one.setTime(yesterday);
        Participate participate_two = new Participate();
        participate_two.setId(101);
        participate_two.setActivity(activity);
        participate_two.setParticipant(user_two);
        participate_two.setTime(yesterday);

        List<Participate> participates = new ArrayList<>();
        participates.add(participate_one);
        participates.add(participate_two);

        when(participateRepository.findByParticipant_IdOrActivity_Id(1)).thenReturn(participates);
        List<PartiDTO> list = participateServer.list(activity.getId());

        assertNotNull(list);
        assertEquals(2, list.size());
        assertEquals(1,list.get(0).getActivity().getId());
        assertEquals(1,list.get(1).getActivity().getId());
        assertEquals(12345,list.get(0).getUser().getUser_id());
        assertEquals(12356,list.get(1).getUser().getUser_id());
    }
}
