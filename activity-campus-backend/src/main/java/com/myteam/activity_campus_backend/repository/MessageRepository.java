package com.myteam.activity_campus_backend.repository;

import com.myteam.activity_campus_backend.dto.response.MessageHistoryResponse;
import com.myteam.activity_campus_backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author sjy15
 * @description: 消息数据库操作
 * @date 2025/10/30 19:35
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    @Query("SELECT m " +
           "FROM Message m " +
           "WHERE m.content=:message AND "+
            "m.user.id=:senderId AND "+
            "m.receiveId=:receiverId AND "+"m.sendTime=:sendTime")
    Message findByContentAndSenderAndReceiverAndTime(@Param("message") String message,
                          @Param("senderId") Integer senderId,
                          @Param("receiverId") Integer receiverId,
                          @Param("sendTime") LocalDateTime sendTime);
    @Query("SELECT m.receiveId,m.user.userName,m.content,m.sendTime " +
            "FROM Message m " +
            "WHERE m.receiveId=:id")
    List<MessageHistoryResponse> findByReceiveId(@Param("id") Integer id);
}
