package com.myteam.activity_campus_backend.service;

import com.myteam.activity_campus_backend.dto.ActivityDTO;
import com.myteam.activity_campus_backend.dto.UserDTO;
import com.myteam.activity_campus_backend.dto.request.*;
import com.myteam.activity_campus_backend.dto.response.*;
import com.myteam.activity_campus_backend.entity.*;
import com.myteam.activity_campus_backend.repository.*;
import io.jsonwebtoken.lang.Assert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.myteam.activity_campus_backend.util.GeoUtil;
/**
 * @author sjy15
 * @description: 活动业务类
 * @date 2025/10/30 19:39
 */
@Service
public class ActivityServer {
    @Autowired
    private ActivityRepository activityRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private LocationRepository locationRepository;
    @Autowired
    private ParticipateRepository participateRepository;
    @Autowired
    private UserlocationRepository userlocationRepository;
    @Autowired
    private GeoUtil geoUtil;
    //创建活动
    public simpleActivityResponse getsimpleActivityResponse(CreateActivityRequest request) {
        //检查时间顺序是否正确
        Assert.isTrue(request.getEndTime().isAfter(request.getStartTime()),"活动结束时间不能早于开始时间");
        Assert.isTrue(request.getRegistrationEndTime().isAfter(request.getRegistrationTime()),"活动报名结束时间不能早于活动报名开始时间");
        Activity activity = new Activity();
        ActivityDTO dto = new ActivityDTO();
        //确保活动名称不会重复
        if(!activityRepository.existsByActivityName(request.getActivityName())){
            Location local=locationRepository.findByDetailAddress(request.getLocationDescription());//获得地点id
            if(local==null){
                return new simpleActivityResponse(dto,false,"地址不存在");
            }
            //确保不会撞时间和地点
            if(!activityRepository.existsConflictActivity(request.getLocationDescription(),request.getStartTime(),request.getEndTime())){
                UserDTO userdto=new UserDTO();
                Optional<User> user1=userRepository.findByUserName(request.getPublisherName());//获得主理人id
                if(user1.isPresent()){
                    User user=user1.get();
                    userdto.setUser_id(user.getId());
                    userdto.setUsername(user.getUserName());
                    activity.setPublisher(user);
                    activity.setActivityName(request.getActivityName());
                    activity.setActivityDescription(request.getActivityDescription());
                    activity.setLocation(local);
                    activity.setDetailedAddress(request.getLocationDescription());
                    activity.setRegistrationTime(request.getRegistrationTime());
                    activity.setRegistrationEndTime(request.getRegistrationEndTime());
                    activity.setStartTime(request.getStartTime());
                    activity.setEndTime(request.getEndTime());
                    activity.setMaxPeople(request.getMaxPeople());
                    activityRepository.save(activity);
                    Integer id=activityRepository.findActivityIdByActivityName(activity.getActivityName());
                    dto.setId(id);
                    dto.setActivityName(activity.getActivityName());
                    dto.setPublisher(userdto);
                    dto.setActivityDescription(activity.getActivityDescription());
                    dto.setLocation(local);
                    dto.setDetailedAddress(request.getLocationDescription());
                    dto.setRegistrationTime(request.getRegistrationTime());
                    dto.setRegistrationEndTime(request.getRegistrationEndTime());
                    dto.setStartTime(activity.getStartTime());
                    dto.setEndTime(activity.getEndTime());
                    dto.setMaxPeople(activity.getMaxPeople());
                    dto.setCurrentPeople(activity.getCurrentPeople());
                    return new simpleActivityResponse(dto,true,"活动创建成功");
                }else{
                    return new simpleActivityResponse(dto,false,"用户不存在");
                }
            }else{
                return new simpleActivityResponse(dto,false,"时间地点与别的活动冲突");
            }
        }else{
            return new simpleActivityResponse(dto,false,"活动名称重复");
        }
    }
    //获得活动列表
    public CheckListActivityResponse ActivityListResponse(ActivityListRequest request) {
        List<Activity> activities=activityRepository.findByActivitiesLike(request.getKeyword());
        if(activities.isEmpty()){
            return new CheckListActivityResponse(false,null);
        }
        List<ActivityDTO> dtos=activities.stream().map(ActivityDTO::convert).collect(Collectors.toList());
        return new CheckListActivityResponse(true,dtos);
    }
    //获得单个活动详情
    public simpleActivityResponse DetailActivityResponse(CheckActivityRequest request){
        Optional<Activity> act=activityRepository.findById(request.getActivityId());
        if(act.isEmpty()){
            return new simpleActivityResponse(null,false,"活动不存在");
        }
        Activity activity=act.get();
        ActivityDTO dto=ActivityDTO.convert(activity);
        return new simpleActivityResponse(dto,true,"找到活动");
    }
    //参加活动
    public ParticipateInActivityResponse participateInActivityResponse(ParticipateInActivityRequest request) {
        Optional<User> user=userRepository.findById(request.getuserId());
        if(user.isEmpty()){
            return new ParticipateInActivityResponse(null,null,"用户不存在");
        }
        Optional<Activity> activity1=activityRepository.findById(request.getActivityId());
        if(activity1.isEmpty()){
            return new ParticipateInActivityResponse(null,null,"活动不存在");
        }
        Activity activity=activity1.get();
        ActivityDTO dto=ActivityDTO.convert(activity);
        UserDTO participant=new UserDTO();
        participant.setUser_id(request.getuserId());
        participant.setUsername(user.get().getUserName());
        return new ParticipateInActivityResponse(participant,dto,"报名活动");
    }
    //同意活动参与申请
    public ParticipateInActivityResponse publisherAgreement(ParticipateInActivityResponse agreement) {
        //参与者
        Optional<User> user1=userRepository.findById(agreement.getParticipant().getUser_id());
        if(user1.isEmpty()){
            agreement.setMessage("用户不存在");
            return agreement;
        }
        User user=user1.get();
        //活动
        Optional<Activity> activity1=activityRepository.findById(agreement.getActivity().getId());
        if(activity1.isEmpty()){
            agreement.setMessage("活动不存在");
            return agreement;
        }
        Activity activity=activity1.get();
        Participate participate=new Participate();
        participate.setParticipant(user);
        participate.setActivity(activity);
        participate.setTime(LocalDateTime.now());
        participateRepository.save(participate);
        agreement.setMessage("同意");
        return agreement;
    }
    //同意后更新活动人数
    public RefreshActivityResponse refresh(ParticipateInActivityResponse agreement){
        Optional<Activity> activity=activityRepository.findById(agreement.getActivity().getId());
        activity.get().setCurrentPeople(agreement.getActivity().getCurrentPeople()+1);
        activityRepository.save(activity.get());
        UserDTO publisher=new UserDTO();
        publisher.setUser_id(activity.get().getPublisher().getId());
        publisher.setUsername(activity.get().getPublisher().getUserName());
        return new RefreshActivityResponse(activity.get().getId(),publisher, activity.get().getCurrentPeople());
    }
    //活动签到
   public CheckInActivityResponse checkInActivity(CheckInActivityRequest checkInActivityRequest) {
        Optional<Userlocation> userl=userlocationRepository.findByUserId(checkInActivityRequest.getUserId());
        if(userl.isEmpty()){
            return new CheckInActivityResponse(checkInActivityRequest,false,"用户不存在");
        }
        Location location= activityRepository.findLocationByActivityId(checkInActivityRequest.getActivityId());
       boolean result=geoUtil.isInArea(userl.get().getLatitude(), userl.get().getLongitude(),location.getCenterLatitude(),location.getCenterLongitude(),location.getRegionRadius());
        return new CheckInActivityResponse(checkInActivityRequest,result,"签到结果");
   }
}
