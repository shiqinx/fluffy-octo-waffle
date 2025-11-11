package com.myteam.activity_campus_backend.unitTest;

import com.myteam.activity_campus_backend.dto.ActivityDTO;
import com.myteam.activity_campus_backend.dto.UserDTO;
import com.myteam.activity_campus_backend.dto.request.*;
import com.myteam.activity_campus_backend.dto.response.*;
import com.myteam.activity_campus_backend.entity.*;
import com.myteam.activity_campus_backend.repository.*;
import com.myteam.activity_campus_backend.service.ActivityServer;
import com.myteam.activity_campus_backend.service.UserService;
import com.myteam.activity_campus_backend.util.GeoUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * @author sjy15
 * @description: 活动测试
 * @date 2025/11/11 02:29
 */
@ExtendWith(MockitoExtension.class)
public class ActivityServerTest {
    @Mock
    private ActivityRepository activityRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private ParticipateRepository participateRepository;
    @Mock
    private UserlocationRepository userlocationRepository;
    @Mock
    private GeoUtil geoUtil;
    @InjectMocks
    private ActivityServer activityServer;
    //生成参数
    private final LocalDateTime now = LocalDateTime.of(2024, 11, 15, 10, 0);
    private User createMockUser(Integer userId,String userName) {
        User user = new User();
        user.setId(userId);
        user.setUserName(userName);
        return user;
    }
    private Activity createMockActivity(Integer activityId, String activityName, User publisher, Location location,String activityDescription) {
        Activity activity = new Activity();
        activity.setId(activityId);
        activity.setActivityName(activityName);
        activity.setActivityDescription(activityDescription);
        activity.setPublisher(publisher);
        activity.setLocation(location);
        activity.setDetailedAddress(location.getDetailAddress());
        activity.setRegistrationTime(now);
        activity.setRegistrationEndTime(now.plusHours(1));
        activity.setStartTime(now.plusHours(2));
        activity.setEndTime(now.plusHours(3));
        activity.setMaxPeople(100);
        activity.setCurrentPeople(0);
        return activity;
    }
    private Location createMockLocation(Integer Id,String detailAddress) {
        Location location = new Location();
        location.setId(Id);
        location.setDetailAddress(detailAddress);
        location.setCenterLatitude(new BigDecimal("39.9975"));
        location.setCenterLongitude(new BigDecimal("116.3376"));
        location.setRegionRadius(new BigDecimal("5000"));
        return location;
    }
    //------------------------getsimpleActivityResponse方法：创建活动--------------------------
    //活动结束时间不能早于开始时间
    @Test
    void getsimpleActivityResponse_EndTimeBeforeStartTime() {
        CreateActivityRequest request = new CreateActivityRequest();
        request.setRegistrationTime(now);
        request.setRegistrationEndTime(now.plusHours(1));
        request.setStartTime(now.plusHours(3));
        request.setEndTime(now.plusHours(2));
        // 2. 调用方法，验证抛出断言异常
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            activityServer.getsimpleActivityResponse(request);
        });
        assertEquals("活动结束时间不能早于开始时间", exception.getMessage());
    }
    //活动报名结束时间不能早于活动报名开始时间
    @Test
    void getsimpleActivityResponse_RegistrationEndTimeBeforeStartTime() {
        CreateActivityRequest request = new CreateActivityRequest();
        request.setRegistrationTime(now.plusHours(1));
        request.setRegistrationEndTime(now);
        request.setStartTime(now.plusHours(2));
        request.setEndTime(now.plusHours(3));
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            activityServer.getsimpleActivityResponse(request);
        });
        assertEquals("活动报名结束时间不能早于活动报名开始时间", exception.getMessage());
    }
    //活动名称重复
    @Test
    void getsimpleActivityResponse_DuplicateName_Fails() {
        CreateActivityRequest request = new CreateActivityRequest();
        request.setRegistrationTime(now);
        request.setRegistrationEndTime(now.plusHours(1));
        request.setStartTime(now.plusHours(2));
        request.setEndTime(now.plusHours(3));
        request.setActivityName("重复活动名");
        when(activityRepository.existsByActivityName(request.getActivityName())).thenReturn(true);
        simpleActivityResponse response = activityServer.getsimpleActivityResponse(request);
        assertFalse(response.isSuccess());
        assertEquals("活动名称重复", response.getMessage());
        verify(activityRepository,never()).save(any(Activity.class));
        assertNotNull(response.getActivityDTO());
    }
    //地址不存在
    @Test
    void getsimpleActivityResponse_LocationNotFound_Fails(){
        CreateActivityRequest request = new CreateActivityRequest();
        request.setRegistrationTime(now);
        request.setRegistrationEndTime(now.plusHours(1));
        request.setStartTime(now.plusHours(2));
        request.setEndTime(now.plusHours(3));
        request.setActivityName("活动名");
        request.setLocationDescription("不存在的地址");
        User user=createMockUser(1,"名字");
        when(activityRepository.existsByActivityName(request.getActivityName())).thenReturn(false);
        when(locationRepository.findByDetailAddress(request.getLocationDescription())).thenReturn(null);
        simpleActivityResponse response = activityServer.getsimpleActivityResponse(request);
        assertFalse(response.isSuccess());
        assertEquals("地址不存在", response.getMessage());
        verify(activityRepository,never()).save(any(Activity.class));
        assertNotNull(response.getActivityDTO());
    }
    //时间地点与别的活动冲突
    @Test
    void getsimpleActivityResponse_TimeLocationConflict_Fails(){
        CreateActivityRequest request = new CreateActivityRequest();
        request.setRegistrationTime(now);
        request.setRegistrationEndTime(now.plusHours(1));
        request.setStartTime(now.plusHours(2));
        request.setEndTime(now.plusHours(3));
        request.setActivityName("冲突活动");
        request.setLocationDescription("冲突地址");
        Location location=createMockLocation(1,request.getLocationDescription());
        when(activityRepository.existsByActivityName(request.getActivityName())).thenReturn(false);
        when(locationRepository.findByDetailAddress(request.getLocationDescription())).thenReturn(location);
        when(activityRepository.existsConflictActivity(request.getLocationDescription(),request.getStartTime(),request.getEndTime())).thenReturn(true);
        simpleActivityResponse response = activityServer.getsimpleActivityResponse(request);
        assertFalse(response.isSuccess());
        assertEquals("时间地点与别的活动冲突", response.getMessage());
        verify(activityRepository,never()).save(any(Activity.class));
        assertNotNull(response.getActivityDTO());
    }
    //用户不存在
    @Test
    void getsimpleActivityResponse_PublisherNotFound_Fails(){
        CreateActivityRequest request = new CreateActivityRequest();
        request.setRegistrationTime(now);
        request.setRegistrationEndTime(now.plusHours(1));
        request.setStartTime(now.plusHours(2));
        request.setEndTime(now.plusHours(3));
        request.setActivityName("活动");
        request.setLocationDescription("地址");
        request.setPublisherName("不存在的名字");
        Location location=createMockLocation(1,request.getLocationDescription());
        when(activityRepository.existsByActivityName(request.getActivityName())).thenReturn(false);
        when(locationRepository.findByDetailAddress(request.getLocationDescription())).thenReturn(location);
        when(activityRepository.existsConflictActivity(request.getLocationDescription(),request.getStartTime(),request.getEndTime())).thenReturn(false);
        when(userRepository.findByUserName(request.getPublisherName())).thenReturn(Optional.empty());
        simpleActivityResponse response = activityServer.getsimpleActivityResponse(request);
        assertFalse(response.isSuccess());
        assertEquals("用户不存在", response.getMessage());
        assertNotNull(response.getActivityDTO());
    }
    //活动创建成功
    @Test
    void getsimpleActivityResponse_OK(){
        CreateActivityRequest request = new CreateActivityRequest();
        request.setRegistrationTime(now);
        request.setRegistrationEndTime(now.plusHours(1));
        request.setStartTime(now.plusHours(2));
        request.setEndTime(now.plusHours(3));
        request.setActivityName("活动");
        request.setLocationDescription("地址");
        request.setPublisherName("发布者名字");
        request.setActivityDescription("activityDescription");
        User user=createMockUser(1,request.getPublisherName());
        Location location=createMockLocation(1,request.getLocationDescription());
        Activity activity=createMockActivity(2,request.getActivityName(),user,location,request.getActivityDescription());
        when(activityRepository.existsByActivityName(request.getActivityName())).thenReturn(false);
        when(locationRepository.findByDetailAddress(request.getLocationDescription())).thenReturn(location);
        when(activityRepository.existsConflictActivity(request.getLocationDescription(),request.getStartTime(),request.getEndTime())).thenReturn(false);
        when(userRepository.findByUserName(request.getPublisherName())).thenReturn(Optional.of(user));
        when(activityRepository.findActivityIdByActivityName(request.getActivityName())).thenReturn(2);
        simpleActivityResponse response = activityServer.getsimpleActivityResponse(request);
        assertTrue(response.isSuccess());
        assertEquals("活动创建成功", response.getMessage());
        assertNotNull(response.getActivityDTO());
        assertEquals(2,response.getActivityDTO().getId());
        verify(activityRepository,times(1)).save(any(Activity.class));
    }
    //------------------------ActivityListResponse方法：获得活动列表--------------------------
    //没结果
    @Test
    void ActivityListResponse_None(){
        ActivityListRequest request=new ActivityListRequest("无结果");
        when(activityRepository.findByActivitiesLike("无结果")).thenReturn(new ArrayList<>());
        CheckListActivityResponse response=activityServer.ActivityListResponse(request);
        assertFalse(response.isResult());
        assertNull(response.getActivities());
    }
    //有两条结果
    @Test
    void ActivityListResponse_OK(){
        ActivityListRequest request=new ActivityListRequest("keyword");
        User user=createMockUser(1,"userName");
        Location location=createMockLocation(2,"detailAddress");
        Activity activity1=createMockActivity(11,"activity_key_one",user,location,"activityDescription");
        Activity activity2=createMockActivity(12,"activity_two",user,location,"key_activityDescription");
        List<Activity> activities=new ArrayList<>();
        activities.add(activity1);
        activities.add(activity2);
        when(activityRepository.findByActivitiesLike("keyword")).thenReturn(activities);
        CheckListActivityResponse response=activityServer.ActivityListResponse(request);
        assertTrue(response.isResult());
        assertNotNull(response.getActivities());
        assertEquals(2, response.getActivities().size());
        assertEquals(11,response.getActivities().get(0).getId());
        assertEquals(12,response.getActivities().get(1).getId());
    }
    //------------------------DetailActivityResponse方法：获得单个活动详情--------------------------
    //活动不存在
    @Test
    void DetailActivityResponse_None(){
        CheckActivityRequest request=new CheckActivityRequest();
        request.setActivityId(1);
        when(activityRepository.findById(request.getActivityId())).thenReturn(Optional.empty());
        simpleActivityResponse response = activityServer.DetailActivityResponse(request);
        assertFalse(response.isSuccess());
        assertNull(response.getActivityDTO());
        assertEquals("活动不存在", response.getMessage());
    }
    //找到活动
    @Test
    void DetailActivityResponse_OK(){
        CheckActivityRequest request=new CheckActivityRequest();
        request.setActivityId(1);
        User user=createMockUser(1,"userName");
        Location location=createMockLocation(2,"detailAddress");
        Activity activity=createMockActivity(1,"name",user,location,"activityDescription");
        when(activityRepository.findById(request.getActivityId())).thenReturn(Optional.of(activity));
        simpleActivityResponse response = activityServer.DetailActivityResponse(request);
        assertTrue(response.isSuccess());
        assertNotNull(response.getActivityDTO());
        assertEquals(1,response.getActivityDTO().getId());
        assertEquals("找到活动",response.getMessage());
    }
    //------------------------participateInActivityResponse方法：参加活动--------------------------
    //用户不存在
    @Test
    void participateInActivityResponse_UserNotFound(){
        ParticipateInActivityRequest request=new ParticipateInActivityRequest(1,2);
        when(userRepository.findById(request.getuserId())).thenReturn(Optional.empty());
        ParticipateInActivityResponse response = activityServer.participateInActivityResponse(request);
        assertNull(response.getActivity());
        assertNull(response.getParticipant());
        assertEquals("用户不存在",response.getMessage());
    }
    //活动不存在
    @Test
    void participateInActivityResponse_ActivityNotFound(){
        ParticipateInActivityRequest request=new ParticipateInActivityRequest(1,2);
        User user=createMockUser(1,"userName");
        when(userRepository.findById(request.getuserId())).thenReturn(Optional.of(user));
        when(activityRepository.findById(request.getActivityId())).thenReturn(Optional.empty());
        ParticipateInActivityResponse response = activityServer.participateInActivityResponse(request);
        assertNull(response.getActivity());
        assertNull(response.getParticipant());
        assertEquals("活动不存在",response.getMessage());
    }
    //报名活动
    @Test
    void participateInActivityResponse_OK(){
        ParticipateInActivityRequest request=new ParticipateInActivityRequest(1,2);
        User user=createMockUser(2,"userName");
        Location location=createMockLocation(3,"detailAddress");
        Activity activity=createMockActivity(1,"name",user,location,"activityDescription");
        when(userRepository.findById(request.getuserId())).thenReturn(Optional.of(user));
        when(activityRepository.findById(request.getActivityId())).thenReturn(Optional.of(activity));
        ParticipateInActivityResponse response = activityServer.participateInActivityResponse(request);
        assertNotNull(response.getActivity());
        assertNotNull(response.getParticipant());
        assertEquals("报名活动",response.getMessage());
        assertEquals(1,response.getActivity().getId());
        assertEquals(2,response.getParticipant().getUser_id());
    }
    //------------------------publisherAgreement方法：同意活动参与申请--------------------------
    //用户不存在
    @Test
    void publisherAgreement_UserNotFound(){
        User user=createMockUser(1,"userName");
        Location location=createMockLocation(2,"detailAddress");
        Activity activity=createMockActivity(11,"activity",user,location,"activityDescription");
        UserDTO userdto=new UserDTO();
        userdto.setUser_id(1);
        userdto.setUsername("user");
        ActivityDTO activitydto=ActivityDTO.convert(activity);
        ParticipateInActivityResponse agreement=new ParticipateInActivityResponse(userdto,activitydto,"报名活动");
        when(userRepository.findById(agreement.getParticipant().getUser_id())).thenReturn(Optional.empty());
        ParticipateInActivityResponse response = activityServer.publisherAgreement(agreement);
        assertEquals("用户不存在",response.getMessage());
    }
    //活动不存在
    @Test
    void publisherAgreement_ActivityNotFound(){
        User user=createMockUser(1,"userName");
        Location location=createMockLocation(2,"detailAddress");
        Activity activity=createMockActivity(11,"activity",user,location,"activityDescription");
        UserDTO userdto=new UserDTO();
        userdto.setUser_id(1);
        userdto.setUsername("user");
        ActivityDTO activitydto=ActivityDTO.convert(activity);
        ParticipateInActivityResponse agreement=new ParticipateInActivityResponse(userdto,activitydto,"报名活动");
        when(userRepository.findById(agreement.getParticipant().getUser_id())).thenReturn(Optional.of(user));
        when(activityRepository.findById(agreement.getActivity().getId())).thenReturn(Optional.empty());
        ParticipateInActivityResponse response = activityServer.publisherAgreement(agreement);
        assertEquals("活动不存在",response.getMessage());
    }
    //同意
    @Test
    void publisherAgreement_OK(){
        User user=createMockUser(1,"userName");
        Location location=createMockLocation(2,"detailAddress");
        Activity activity=createMockActivity(11,"activity",user,location,"activityDescription");
        UserDTO userdto=new UserDTO();
        userdto.setUser_id(1);
        userdto.setUsername("user");
        ActivityDTO activitydto=ActivityDTO.convert(activity);
        ParticipateInActivityResponse agreement=new ParticipateInActivityResponse(userdto,activitydto,"报名活动");
        when(userRepository.findById(agreement.getParticipant().getUser_id())).thenReturn(Optional.of(user));
        when(activityRepository.findById(agreement.getActivity().getId())).thenReturn(Optional.of(activity));
        ParticipateInActivityResponse response = activityServer.publisherAgreement(agreement);
        assertNotNull(response.getActivity());
        assertNotNull(response.getParticipant());
        assertEquals("同意",response.getMessage());
        assertEquals(11,response.getActivity().getId());
        assertEquals(1,response.getParticipant().getUser_id());
        verify(participateRepository,times(1)).save(any(Participate.class));
    }
    //------------------------refresh方法：同意后更新活动人数--------------------------
    //更新人数
    @Test
    void refresh_OK(){
        User user=createMockUser(1,"userName");
        Location location=createMockLocation(2,"detailAddress");
        Activity activity=createMockActivity(11,"activity",user,location,"activityDescription");
        Integer OldNumber=activity.getCurrentPeople();
        UserDTO userdto=new UserDTO();
        userdto.setUser_id(2);
        userdto.setUsername("user");
        ActivityDTO activitydto=ActivityDTO.convert(activity);
        ParticipateInActivityResponse agreement=new ParticipateInActivityResponse(userdto,activitydto,"同意");
        when(activityRepository.findById(agreement.getActivity().getId())).thenReturn(Optional.of(activity));
        RefreshActivityResponse response = activityServer.refresh(agreement);
        assertEquals(11,response.getActivityId());
        assertEquals(1,response.getPublisherId().getUser_id());
        assertEquals(OldNumber+1,response.getCurrentPeople());
        verify(activityRepository, times(1)).save(activity);
        assertEquals(OldNumber+1,activity.getCurrentPeople());
    }
    //------------------------checkInActivity方法：活动签到--------------------------
    //找不到用户实时位置
    @Test
    void checkInActivity_UserLocationNotFound(){
        CheckInActivityRequest request=new CheckInActivityRequest(1,11);
        when(userlocationRepository.findByUserId(1)).thenReturn(Optional.empty());
        CheckInActivityResponse response = activityServer.checkInActivity(request);
        assertEquals(false,response.getSuccess());
    }
    //用户不在范围内
    @Test
    void checkInActivity_UserNotAround(){
        CheckInActivityRequest request=new CheckInActivityRequest(1,11);
        Userlocation userlocation=new Userlocation();
        userlocation.setLatitude(new BigDecimal("30.0000")); // 远离活动区域
        userlocation.setLongitude(new BigDecimal("120.0000"));

        Location location=createMockLocation(100, "北京市海淀区中关村大街1号");
        when(userlocationRepository.findByUserId(1)).thenReturn(Optional.of(userlocation));
        when(activityRepository.findLocationByActivityId(11)).thenReturn(location);
        when(geoUtil.isInArea(userlocation.getLatitude(),userlocation.getLongitude(),location.getCenterLatitude(),location.getCenterLongitude(),location.getRegionRadius())).thenReturn(false);
        CheckInActivityResponse response = activityServer.checkInActivity(request);
        assertEquals(false,response.getSuccess());
    }
    //用户签到成功
    @Test
    void checkInActivity_OK(){
        CheckInActivityRequest request=new CheckInActivityRequest(1,11);
        Userlocation userlocation=new Userlocation();
        userlocation.setLatitude(new BigDecimal("39.9975"));
        userlocation.setLongitude(new BigDecimal("116.3376"));
        Location location=createMockLocation(100, "北京市海淀区中关村大街1号");
        when(userlocationRepository.findByUserId(1)).thenReturn(Optional.of(userlocation));
        when(activityRepository.findLocationByActivityId(11)).thenReturn(location);
        when(geoUtil.isInArea(userlocation.getLatitude(),userlocation.getLongitude(),location.getCenterLatitude(),location.getCenterLongitude(),location.getRegionRadius())).thenReturn(true);
        CheckInActivityResponse response = activityServer.checkInActivity(request);
        assertEquals(true,response.getSuccess());
        assertEquals(request, response.getRequest());
    }
}
