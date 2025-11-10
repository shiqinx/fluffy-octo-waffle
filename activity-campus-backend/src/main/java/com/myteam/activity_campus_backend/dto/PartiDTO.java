package com.myteam.activity_campus_backend.dto;

import com.myteam.activity_campus_backend.entity.Participate;

import java.time.LocalDateTime;

/**
 * @author sjy15
 * @description: 参与活动
 * @date 2025/11/2 22:49
 */
public class PartiDTO {
    private Integer id;
    private UserDTO user;
    private ActivityDTO activity;
    private LocalDateTime time;
    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }
    public UserDTO getUser() {
        return user;
    }
    public void setUser(UserDTO user) {
        this.user = user;
    }
    public ActivityDTO getActivity() {
        return activity;
    }
    public void setActivity(ActivityDTO activity) {
        this.activity = activity;
    }
    public LocalDateTime getTime() {
        return time;
    }
    public void setTime(LocalDateTime time) {
        this.time = time;
    }
    public static PartiDTO toDTO(Participate participate) {
        PartiDTO partiDTO = new PartiDTO();
        partiDTO.setId(participate.getId());
        UserDTO userDTO = new UserDTO();
        userDTO.setUser_id(participate.getParticipant().getId());
        userDTO.setUsername(participate.getParticipant().getUserName());
        partiDTO.setUser(userDTO);
        ActivityDTO activityDTO =ActivityDTO.convert(participate.getActivity());
        partiDTO.setActivity(activityDTO);
        partiDTO.setTime(participate.getTime());
        return partiDTO;
    }
}
