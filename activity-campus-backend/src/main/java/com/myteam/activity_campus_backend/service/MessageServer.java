package com.myteam.activity_campus_backend.service;

import com.myteam.activity_campus_backend.dto.MessageSendDTO;
import com.myteam.activity_campus_backend.dto.response.ListMessageHistory;
import com.myteam.activity_campus_backend.dto.request.MessageHistoryRequest;
import com.myteam.activity_campus_backend.dto.request.RecallMessageRequest;
import com.myteam.activity_campus_backend.dto.response.MessageHistoryResponse;
import com.myteam.activity_campus_backend.entity.Message;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.repository.MessageRepository;
import com.myteam.activity_campus_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * @author sjy15
 * @description: 消息服务
 * @date 2025/11/1 00:40
 */
@Service
public class MessageServer {
    @Autowired
    private MessageRepository MessageRepository;
    @Autowired
    private UserRepository userRepository;
    //撤回消息
    public String recallMessage(RecallMessageRequest recall) {
        Message message=MessageRepository.findByContentAndSenderAndReceiverAndTime(recall.getMessage(), recall.getSenderId(), recall.getReceiverId(),recall.getTime());
        if(message==null){
            return "消息不存在";
        }
        MessageRepository.delete(message);
        return "撤回成功";
    }
    //发送信息
    public String sendMessage(MessageSendDTO savedMessage) {
        Message message=new Message();
        Optional<User> sender=userRepository.findById(savedMessage.getSenderId());
        if(sender.isEmpty()){
            return "发送者不存在";
        }
        User user=sender.get();
        message.setUser(user);
        message.setReceiveId(savedMessage.getReceiverId());//活动id
        message.setContent(savedMessage.getMessage());
        message.setSendTime(LocalDateTime.now());
        MessageRepository.save(message);
        return "发送成功";
    }
    //查看消息历史
    public ListMessageHistory messageHistory(MessageHistoryRequest messageHistoryRequest) {
        List<MessageHistoryResponse> messageList=MessageRepository.findByReceiveId(messageHistoryRequest.getReceiveId());
        if(messageList.isEmpty()){
            return new ListMessageHistory(null,false);
        }
        return new ListMessageHistory(messageList,true);
    }
}
