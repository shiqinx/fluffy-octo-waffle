package com.myteam.activity_campus_backend.util;


/**
 * @author sjy15
 * @description: 生成测试数据
 * @date 2025/11/14 15:46
 */
public class TestDataGeneration {
    public static void main(String[] args){
        System.out.println("--使用BCryptUtil生成的测试数据");
        System.out.println();
        //生成加密密码
        String userPassword = BCryptUtil.encrypt("123456");

        System.out.println("--用户数据");
        System.out.println("INSERT INTO \"user\" (user_Id,user_Name,user_Password,user_Status) VALUES");
        System.out.printf("(1001,'陈道明','%s','INACTIVE'),%n",userPassword);
        System.out.printf("(1002,'萧萧','%s','INACTIVE'),%n",userPassword);
        System.out.printf("(1003,'罗韩','%s','INACTIVE'),%n",userPassword);
        System.out.printf("(1004,'李春','%s','ACTIVE');%n",userPassword);

        System.out.println("--实时位置数据");
        System.out.println("INSERT INTO \"userlocation\" (record_Id, user_Id, longitude, latitude, valid_time) VALUES");
        System.out.println("(4001, 1003, 116.407394, 39.904202, " + System.currentTimeMillis() + "),");
        System.out.println("(4002, 1004, 116.407500, 39.904300, " + System.currentTimeMillis() + "),");
        System.out.println("(4003, 1005, 116.407600, 39.904400, " + System.currentTimeMillis() + "),");
        System.out.println("(4004, 1002, 116.407700, 39.904500, " + System.currentTimeMillis() + ");");
        System.out.println();

        System.out.println("--地图数据");
        System.out.println("INSERT INTO \"location\" (location_Id, region_Name, center_Latitude, center_Longitude, dministrative_Code, region_Type, detail_Address, is_Enabled, region_Radius) VALUES");
        System.out.println("(3001, '学校操场', 39.904202, 116.407394, '110101', 'SPORTS_FIELD', '北京市东城区校园路1号学校操场', true, 500.00),");
        System.out.println("(3002, '计算机实验室', 39.904500, 116.407800, '110101', 'LABORATORY', '北京市东城区校园路1号计算机学院3楼301室', true, 50.00),");
        System.out.println("(3003, '学术报告厅', 39.904300, 116.407600, '110101', 'AUDITORIUM', '北京市东城区校园路1号图书馆1层学术报告厅', true, 100.00),");
        System.out.println("(3004, '体育馆', 39.904700, 116.407200, '110101', 'GYMNASIUM', '北京市东城区校园路1号体育馆主馆', true, 300.00),");
        System.out.println("(3005, '学生活动中心', 39.904400, 116.407500, '110101', 'ACTIVITY_CENTER', '北京市东城区校园路1号学生活动中心2楼', true, 80.00);");
        System.out.println();

        System.out.println("-- 密码验证信息:");
        System.out.printf("123456 -> %s (验证: %s)%n", userPassword, BCryptUtil.matches("123456", userPassword));
    }
}
