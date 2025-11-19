package com.myteam.activity_campus_backend.unitTest;

import com.myteam.activity_campus_backend.dto.MessageSendDTO;
import com.myteam.activity_campus_backend.dto.request.MessageHistoryRequest;
import com.myteam.activity_campus_backend.dto.request.RecallMessageRequest;
import com.myteam.activity_campus_backend.dto.response.ListMessageHistory;
import com.myteam.activity_campus_backend.dto.response.MessageHistoryResponse;
import com.myteam.activity_campus_backend.entity.Message;
import com.myteam.activity_campus_backend.entity.User;
import com.myteam.activity_campus_backend.repository.MessageRepository;
import com.myteam.activity_campus_backend.repository.UserRepository;
import com.myteam.activity_campus_backend.service.MessageServer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

/**
 * @author sjy15
 * @description: 消息层测试
 * @date 2025/11/10 20:26
 */
@ExtendWith(MockitoExtension.class)
public class MessageServerTest {
    @Mock
    private MessageRepository messageRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private MessageServer messageServer;
    //----------------recallMessage方法：撤回消息--------------
    //消息不存在
    @Test
    void recallMessage_messageNotFound(){
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sendTime = now.plusMinutes(5);
        RecallMessageRequest request=new RecallMessageRequest();
        request.setSenderId(1);
        request.setReceiverId(2);
        request.setMessage("content");
        request.setTime(sendTime);
        when(messageRepository.findByContentAndSenderAndReceiverAndTime(request.getMessage(),request.getSenderId(),request.getReceiverId(),request.getTime())).thenReturn(null);
        String result=messageServer.recallMessage(request);
        assertEquals("消息不存在",result);
        verify(messageRepository, never()).delete(any(Message.class));
    }
    //撤回成功
    @Test
    void recallMessage_OK(){
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sendTime = now.plusMinutes(5);
        User user = new User();
        user.setId(1);
        user.setUserName("user");
        Message message=new Message();
        message.setUser(user);
        message.setReceiveId(2);
        message.setSendTime(sendTime);
        message.setContent("content");

        RecallMessageRequest request=new RecallMessageRequest();
        request.setSenderId(1);
        request.setReceiverId(2);
        request.setMessage("content");
        request.setTime(sendTime);

        when(messageRepository.findByContentAndSenderAndReceiverAndTime(request.getMessage(),request.getSenderId(),request.getReceiverId(),request.getTime())).thenReturn(message);
        String result=messageServer.recallMessage(request);
        assertEquals("撤回成功",result);
        verify(messageRepository, times(1)).delete(message);
    }
    //--------------------sendMessage方法：发送信息-------------------------------------
    //发送者不存在
    @Test
    void sendMessage_SenderNotFound(){
        MessageSendDTO messageSend=new MessageSendDTO("content",12,23);
        when(userRepository.findById(12)).thenReturn(Optional.empty());
        String result=messageServer.sendMessage(messageSend);
        assertEquals("发送者不存在",result);
        verify(messageRepository, never()).save(any(Message.class));
    }
    //发送成功
    @Test
    void sendMessage_OK(){
        MessageSendDTO messageSend=new MessageSendDTO("content",12,23);
        User user = new User();
        user.setId(12);
        user.setUserName("user");
        when(userRepository.findById(12)).thenReturn(Optional.of(user));
        String result=messageServer.sendMessage(messageSend);
        assertEquals("发送成功",result);
        verify(messageRepository, times(1)).save(argThat(message ->
            message.getUser().getId().equals(12)&&
                    message.getReceiveId().equals(23)&&
                    message.getContent().equals("content")&&
                    message.getSendTime()!=null
        ));
    }
    //--------------------messageHistory方法：发送信息-------------------------------------
    //没有消息历史
    @Test
    void messageHistory_None(){
        Integer receiveId = 1;
        MessageHistoryRequest request=new MessageHistoryRequest();
        request.setReceiveId(receiveId);
        when(messageRepository.findByReceiveId(receiveId)).thenReturn(new ArrayList<>());
        ListMessageHistory result=messageServer.messageHistory(request);
        assertNull(result.getMessageHistory());
        assertEquals(false,result.getResult());
    }
    //有3条历史消息
    @Test
    void messageHistory_OK(){
        Instant fixedInstant_1 = Instant.parse("2024-11-10T12:00:00Z"); // 2024年11月10日12:00:00 UTC
        Instant fixedInstant_2=Instant.parse("2024-11-10T12:01:00Z");
        Instant fixedInstant_3=Instant.parse("2024-11-10T12:02:00Z");
        Integer receiveId = 1;
        MessageHistoryRequest request=new MessageHistoryRequest();
        request.setReceiveId(receiveId);

        MessageHistoryResponse messages_1=new MessageHistoryResponse(1,"user1","消息1",fixedInstant_1);
        MessageHistoryResponse messages_2=new MessageHistoryResponse(1,"user2","消息2",fixedInstant_2);
        MessageHistoryResponse messages_3=new MessageHistoryResponse(1,"user3","消息3",fixedInstant_3);

        List<MessageHistoryResponse> list=new ArrayList<>();
        list.add(messages_1);
        list.add(messages_2);
        list.add(messages_3);

        when(messageRepository.findByReceiveId(receiveId)).thenReturn(list);
        ListMessageHistory result=messageServer.messageHistory(request);
        assertEquals(true,result.getResult());
        assertEquals(3,result.getMessageHistory().size());
        assertEquals(1,result.getMessageHistory().get(0).getReceiveId());
        assertEquals("消息2",result.getMessageHistory().get(1).getContent());
    }
}
