package com.myteam.activity_campus_backend.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class GeoUtil {
    // 地球半径（单位：米，使用BigDecimal确保精度）
    private static final BigDecimal EARTH_RADIUS = new BigDecimal("6371000");
    // 常量：π（用于角度转弧度）
    private static final BigDecimal PI = new BigDecimal(Math.PI);
    // 常量：180（角度转弧度的分母）
    private static final BigDecimal ONE_EIGHTY = new BigDecimal("180");
    // 常量：2（公式中多次用到的倍数）
    private static final BigDecimal TWO = new BigDecimal("2");


    /**
     * 判断用户是否在指定圆形区域内（所有参数使用BigDecimal）
     *
     * @param userLat    用户纬度（度，范围：-90 ~ 90）
     * @param userLng    用户经度（度，范围：-180 ~ 180）
     * @param centerLat  区域中心点纬度（度，范围：-90 ~ 90）
     * @param centerLng  区域中心点经度（度，范围：-180 ~ 180）
     * @param radius     区域半径（米，≥0）
     * @return true：在区域内；false：在区域外
     */
    public static boolean isInArea(BigDecimal userLat, BigDecimal userLng,
                                   BigDecimal centerLat, BigDecimal centerLng,
                                   BigDecimal radius) {
        // 1. 参数校验（合法性与非空判断）
        if (userLat == null || userLng == null || centerLat == null || centerLng == null || radius == null) {
            throw new IllegalArgumentException("地理参数不能为null");
        }
        if (!isValidLatitude(userLat) || !isValidLongitude(userLng)
                || !isValidLatitude(centerLat) || !isValidLongitude(centerLng)
                || radius.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("无效的地理参数：经纬度或半径格式错误");
        }

        // 2. 计算用户与中心点的球面距离（米）
        BigDecimal distance = calculateDistance(userLat, userLng, centerLat, centerLng);

        // 3. 比较距离与半径（保留2位小数，四舍五入）
        BigDecimal distanceScaled = distance.setScale(2, RoundingMode.HALF_UP);
        BigDecimal radiusScaled = radius.setScale(2, RoundingMode.HALF_UP);
        return distanceScaled.compareTo(radiusScaled) <= 0;
    }


    /**
     * 校验纬度是否合法（-90 ~ 90度）
     */
    private static boolean isValidLatitude(BigDecimal latitude) {
        return latitude.compareTo(new BigDecimal("-90")) >= 0
                && latitude.compareTo(new BigDecimal("90")) <= 0;
    }


    /**
     * 校验经度是否合法（-180 ~ 180度）
     */
    private static boolean isValidLongitude(BigDecimal longitude) {
        return longitude.compareTo(new BigDecimal("-180")) >= 0
                && longitude.compareTo(new BigDecimal("180")) <= 0;
    }


    /**
     * 基于Haversine公式计算两点间的地球表面距离（米）
     * 所有计算均使用BigDecimal，避免精度丢失
     */
    private static BigDecimal calculateDistance(BigDecimal lat1, BigDecimal lng1,
                                                BigDecimal lat2, BigDecimal lng2) {
        // 1. 将角度转为弧度（弧度 = 角度 * π / 180）
        BigDecimal radLat1 = toRadians(lat1);
        BigDecimal radLat2 = toRadians(lat2);
        BigDecimal radLng1 = toRadians(lng1);
        BigDecimal radLng2 = toRadians(lng2);

        // 2. 计算纬度差和经度差
        BigDecimal deltaLat = radLat2.subtract(radLat1);
        BigDecimal deltaLng = radLng2.subtract(radLng1);

        // 3. Haversine公式核心计算
        // a = sin²(Δφ/2) + cosφ1 * cosφ2 * sin²(Δλ/2)
        BigDecimal sinDeltaLatHalf = sin(deltaLat.divide(TWO, 20, RoundingMode.HALF_UP));
        BigDecimal sinDeltaLngHalf = sin(deltaLng.divide(TWO, 20, RoundingMode.HALF_UP));

        BigDecimal a = sinDeltaLatHalf.pow(2)
                .add(cos(radLat1)
                        .multiply(cos(radLat2))
                        .multiply(sinDeltaLngHalf.pow(2)));

        // c = 2 * atan2(√a, √(1−a))
        BigDecimal sqrtA = sqrt(a, 20);
        BigDecimal sqrt1MinusA = sqrt(BigDecimal.ONE.subtract(a), 20);
        BigDecimal c = TWO.multiply(atan2(sqrtA, sqrt1MinusA));

        // 4. 距离 = 地球半径 * c（米）
        return EARTH_RADIUS.multiply(c).setScale(6, RoundingMode.HALF_UP);
    }


    /**
     * 角度转弧度（ BigDecimal实现 ）
     */
    private static BigDecimal toRadians(BigDecimal degrees) {
        return degrees.multiply(PI).divide(ONE_EIGHTY, 20, RoundingMode.HALF_UP);
    }


    /**
     * 计算正弦值（基于Math.sin，转换为BigDecimal）
     * 注：三角函数计算需通过double过渡，保留20位小数确保精度
     */
    private static BigDecimal sin(BigDecimal radians) {
        double sinValue = Math.sin(radians.doubleValue());
        return new BigDecimal(sinValue).setScale(20, RoundingMode.HALF_UP);
    }


    /**
     * 计算余弦值（基于Math.cos，转换为BigDecimal）
     */
    private static BigDecimal cos(BigDecimal radians) {
        double cosValue = Math.cos(radians.doubleValue());
        return new BigDecimal(cosValue).setScale(20, RoundingMode.HALF_UP);
    }


    /**
     * 计算反正切值（atan2(y, x)，基于Math.atan2，转换为BigDecimal）
     */
    private static BigDecimal atan2(BigDecimal y, BigDecimal x) {
        double atan2Value = Math.atan2(y.doubleValue(), x.doubleValue());
        return new BigDecimal(atan2Value).setScale(20, RoundingMode.HALF_UP);
    }


    /**
     * 计算平方根（牛顿迭代法实现BigDecimal高精度开方）
     * @param value 被开方数
     * @param scale 精度（保留小数位数）
     */
    private static BigDecimal sqrt(BigDecimal value, int scale) {
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new ArithmeticException("不能对负数开平方");
        }
        BigDecimal guess = value;
        BigDecimal prev;
        do {
            prev = guess;
            guess = value.divide(guess, scale + 1, RoundingMode.HALF_UP)
                    .add(guess)
                    .divide(TWO, scale + 1, RoundingMode.HALF_UP);
        } while (guess.subtract(prev).abs().compareTo(new BigDecimal("1e-" + (scale + 1))) > 0);
        return guess.setScale(scale, RoundingMode.HALF_UP);
    }
}