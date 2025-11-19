package com.myteam.activity_campus_backend.dto.response;

import java.util.List;

/**
 * @author sjy15
 * @description: 打包历史消息
 * @date 2025/11/1 02:18
 */
public class ListMessageHistory {
    private List<MessageHistoryResponse> messageHistory;
    private Boolean result;
    public ListMessageHistory(List<MessageHistoryResponse> messageHistory, Boolean result) {
        this.messageHistory = messageHistory;
        this.result = result;
    }
    public List<MessageHistoryResponse> getMessageHistory() {
        return messageHistory;
    }
    public void setMessageHistory(List<MessageHistoryResponse> messageHistory) {
        this.messageHistory = messageHistory;
    }
    public Boolean getResult() {
        return result;
    }
    public void setResult(Boolean result) {
        this.result = result;
    }
}
