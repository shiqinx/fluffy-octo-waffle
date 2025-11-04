package com.myteam.activity_campus_backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class JWTTokenUtil {

    // 从配置文件注入密钥和过期时间（非static，解决@Value注入static字段问题）
    @Getter
    @Setter
    @Value("${jwt.secret}")
    private String secret;

    @Getter
    @Setter
    @Value("${jwt.access-expiration}")
    private long accessExpiration; // 单位：毫秒

    @Getter
    @Setter
    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration; // 单位：毫秒


    // 密钥生成（懒加载，避免初始化时secret未注入）
    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // 生成访问令牌（用户ID+自定义载荷）
    public String generateAccessToken(Map<String, Object> claims, Integer userId) {
        return generateToken(accessExpiration, userId, claims);
    }

    // 生成刷新令牌（用户ID+默认载荷）
    public String generateRefreshToken(Integer userId) {
        return generateToken(refreshExpiration, userId, new HashMap<>());
    }

    // 通用令牌生成逻辑（兼容Spring Boot 3.x）
    private String generateToken(long expiresInMillis, Integer userId, Map<String, Object> claims) {
        return Jwts.builder()
                .claims(claims) // 自定义载荷（如角色、权限）
                .id(UUID.randomUUID().toString()) // 令牌唯一标识（jti）
                .issuer("ActivitySystem") // 签发人（系统标识）
                .issuedAt(new Date()) // 签发时间（iat）
                .subject(String.valueOf(userId)) // 主题（存储用户ID，sub）
                .expiration(new Date(System.currentTimeMillis() + expiresInMillis)) // 过期时间（exp）
                .signWith(getSecretKey(), SignatureAlgorithm.HS256) // 签名算法+密钥
                .compact();
    }

    // 解析令牌获取所有声明（兼容Spring Boot 3.x的verifyWith方式）
    public Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSecretKey()) // 验证密钥
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new RuntimeException("无效的JWT令牌", e);
        }
    }

    // 从令牌中获取用户ID（subject字段）
    public Integer getUserIdFromToken(String token) {
        String subject = getClaimsFromToken(token).getSubject();
        return Integer.parseInt(subject);
    }

    // 获取所有自定义声明（排除标准声明）
    public Map<String, Object> getCustomClaims(String token) {
        Claims claims = getClaimsFromToken(token);
        Map<String, Object> customClaims = new HashMap<>();
        claims.forEach((key, value) -> {
            if (!isStandardClaim(key)) {
                customClaims.put(key, value);
            }
        });
        return customClaims;
    }

    // 判断是否为JWT标准声明（避免自定义声明覆盖标准字段）
    private boolean isStandardClaim(String claimName) {
        return claimName.equals("iss") || claimName.equals("sub") ||
                claimName.equals("aud") || claimName.equals("exp") ||
                claimName.equals("nbf") || claimName.equals("iat") ||
                claimName.equals("jti");
    }

    // 检查令牌是否过期
    public boolean isTokenExpired(String token) {
        Date expiration = getClaimsFromToken(token).getExpiration();
        return expiration.before(new Date());
    }

    // 验证令牌有效性（未过期+签名正确）
    public boolean validateToken(String token) {
        try {
            getClaimsFromToken(token); // 解析成功即签名正确
            return !isTokenExpired(token); // 且未过期
        } catch (Exception e) {
            return false;
        }
    }

    // 刷新令牌（基于旧令牌生成新令牌，保留用户ID和自定义载荷）
    public String refreshToken(String oldToken, boolean isAccessToken) {
        if (!canTokenBeRefreshed(oldToken)) {
            throw new RuntimeException("令牌已过期，无法刷新");
        }
        Claims claims = getClaimsFromToken(oldToken);
        Integer userId = Integer.parseInt(claims.getSubject());
        Map<String, Object> customClaims = getCustomClaims(oldToken);
        // 根据类型选择过期时间
        long expiration = isAccessToken ? accessExpiration : refreshExpiration;
        return generateToken(expiration, userId, customClaims);
    }

    // 检查令牌是否可刷新（未过期）
    public boolean canTokenBeRefreshed(String token) {
        return !isTokenExpired(token);
    }

    // 从请求头提取令牌（处理Bearer前缀）
    public String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // 去除"Bearer "前缀
        }
        return null;
    }
    // 添加方法：判断令牌是否即将过期（用于提前刷新）
    public boolean isTokenAboutToExpire(String token, long thresholdMillis) {
        try {
            Date expiration = getClaimsFromToken(token).getExpiration();
            long timeUntilExpiry = expiration.getTime() - System.currentTimeMillis();
            return timeUntilExpiry <= thresholdMillis;
        } catch (Exception e) {
            return true;
        }
    }
    // 添加方法：从请求头提取令牌
    public String extractTokenFromHeader(String authorizationHeader) {
        if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }

    // 添加方法：专门用于刷新访问令牌
    public String refreshAccessToken(String refreshToken) {
        if (!validateToken(refreshToken)) {
            throw new RuntimeException("刷新令牌无效或已过期");
        }
        Integer userId = getUserIdFromToken(refreshToken);
        Map<String, Object> claims = getCustomClaims(refreshToken);
        return generateAccessToken(claims, userId);
    }
}
