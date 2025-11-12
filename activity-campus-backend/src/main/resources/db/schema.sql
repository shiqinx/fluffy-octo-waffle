CREATE TABLE "user" (
                      user_Id INT NOT NULL COMMENT '用户唯一标识',
                      user_Name VARCHAR(50) NOT NULL COMMENT '用户姓名',
                      user_Password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
                      user_Status VARCHAR(20) NOT NULL COMMENT '用户账户状态说明',
                      PRIMARY KEY (user_Id)
);
CREATE TABLE "team" (
                      team_Id INT NOT NULL AUTO_INCREMENT COMMENT '团队ID',
                      team_Name VARCHAR(50) NOT NULL COMMENT '团队名称',
                      creator_Id INT NOT NULL COMMENT '创建者ID',
                      PRIMARY KEY (team_Id),
                      CONSTRAINT team_ibfk_1 FOREIGN KEY (creator_Id) REFERENCES "user"(user_Id)
);
CREATE TABLE "location" (
                          location_Id INT NOT NULL AUTO_INCREMENT COMMENT '地址记录ID',
                          region_Name VARCHAR(100) NOT NULL COMMENT '地点名称',
                          center_Latitude DECIMAL(10,6) NOT NULL COMMENT '纬度坐标',
                          center_Longitude DECIMAL(10,6) NOT NULL COMMENT '经度坐标',
                          dministrative_Code VARCHAR(20) NOT NULL COMMENT '行政区划编码',
                          region_Type VARCHAR(50) NOT NULL COMMENT '区域类型',
                          detail_Address VARCHAR(500) NOT NULL COMMENT '详细地址',
                          is_Enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT '地址是否启用',
                          region_Radius DECIMAL(10,2) NOT NULL COMMENT '区域半径',
                          PRIMARY KEY (location_Id)
);
CREATE TABLE "userlocation" (
                              record_Id INT NOT NULL AUTO_INCREMENT COMMENT '用户位置唯一标识',
                              user_Id INT NOT NULL COMMENT '用户ID',
                              longitude DECIMAL(10,6) NOT NULL COMMENT '经度',
                              latitude DECIMAL(10,6) NOT NULL COMMENT '纬度',
                              valid_time BIGINT NOT NULL,
                              PRIMARY KEY (record_Id),
                              CONSTRAINT userlocation_ibfk_1 FOREIGN KEY (user_Id) REFERENCES "user"(user_Id)
);
CREATE INDEX idx_UserLocation_User_Id ON "userlocation"(user_Id);
CREATE TABLE "activity" (
                          activity_Id INT NOT NULL AUTO_INCREMENT COMMENT '活动 ID',
                          publisher_Id INT NOT NULL COMMENT '发布者 ID',
                          activity_Name VARCHAR(100) NOT NULL COMMENT '活动标题',
                          activity_description VARCHAR(255) COMMENT '活动描述',
                          location_Id INT NOT NULL COMMENT '活动地址ID',
                          detailed_Address VARCHAR(500) NOT NULL COMMENT '活动详细地址',
                          registration_Time TIMESTAMP NOT NULL COMMENT '报名开始时间',
                          registration_End_time TIMESTAMP NOT NULL COMMENT '报名结束时间',
                          start_Time TIMESTAMP NOT NULL COMMENT '活动开始时间',
                          end_Time TIMESTAMP NOT NULL COMMENT '活动结束时间',
                          max_People INT NOT NULL DEFAULT 1 COMMENT '最大人数',
                          current_People INT NOT NULL DEFAULT 0 COMMENT '当前人数',
                          PRIMARY KEY (activity_Id),
                          CONSTRAINT activity_ibfk_1 FOREIGN KEY (publisher_Id) REFERENCES "user"(user_Id),
                          CONSTRAINT activity_ibfk_2 FOREIGN KEY (location_Id) REFERENCES "location"(location_Id)
);
CREATE INDEX idx_Activity_Publisher_Id ON "activity"(publisher_Id);
CREATE INDEX idx_Activity_Location_Id ON "activity"(location_Id);
CREATE TABLE "message" (
                         message_Id INT NOT NULL AUTO_INCREMENT COMMENT '消息唯一标识',
                         receive_Id INT NOT NULL COMMENT '接收方ID',
                         user_Id INT NOT NULL COMMENT '发送者ID',
                         content VARCHAR(255) NOT NULL,
                         send_Time TIMESTAMP NOT NULL COMMENT '发送时间',
                         PRIMARY KEY (message_Id),
                         CONSTRAINT message_ibfk_1 FOREIGN KEY (user_Id) REFERENCES "user"(user_Id)
);
CREATE INDEX idx_Message_User_Id ON "message"(user_Id);
CREATE INDEX idx_Message_Receive_Id ON "message"(receive_Id);
CREATE TABLE "belong" (
                        team_record_Id INT NOT NULL AUTO_INCREMENT COMMENT '成员记录唯一标识',
                        team_Id INT NOT NULL COMMENT '团队ID',
                        user_Id INT NOT NULL COMMENT '用户 ID',
                        join_Time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
                        PRIMARY KEY (team_record_Id),
                        UNIQUE (team_Id, user_Id),
                        CONSTRAINT belong_ibfk_1 FOREIGN KEY (team_Id) REFERENCES "team"(team_Id),
                        CONSTRAINT belong_ibfk_2 FOREIGN KEY (user_Id) REFERENCES "user"(user_Id)
);
CREATE INDEX idx_Belong_Team_Id ON "belong"(team_Id);
CREATE INDEX idx_Belong_User_Id ON "belong"(user_Id);
CREATE TABLE "participate" (
                             part_Id INT NOT NULL AUTO_INCREMENT COMMENT '报名记录管理',
                             participant_Id INT NOT NULL COMMENT '申请人 ID',
                             activity_Id INT NOT NULL COMMENT '活动 ID',
                             time TIMESTAMP NOT NULL COMMENT '报名时间',
                             PRIMARY KEY (part_Id),
                             UNIQUE (participant_Id, activity_Id),
                             CONSTRAINT participate_ibfk_1 FOREIGN KEY (participant_Id) REFERENCES "user"(user_Id),
                             CONSTRAINT participate_ibfk_2 FOREIGN KEY (activity_Id) REFERENCES "activity"(activity_Id)
);
CREATE INDEX idx_Participate_Participant_Id ON "participate"(participant_Id);
CREATE INDEX idx_Participate_Activity_Id ON "participate"(activity_Id);