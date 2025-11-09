package com.myteam.activity_campus_backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class JWTTokenUtil {

    // 从配置文件注入密钥和过期时间
    @Value("${jwt.secret}")
    private String secret;

    // Getter方法
    @Getter
    @Value("${jwt.access-expiration}")
    private long accessExpiration;

    @Getter
    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @Getter
    @Value("${jwt.remember-expiration}")
    private long rememberExpiration;

    // 缓存密钥避免重复生成
    private SecretKey secretKeyCache;

    // 密钥生成（线程安全，懒加载）
    private SecretKey getSecretKey() {
        if (secretKeyCache == null) {
            synchronized (this) {
                if (secretKeyCache == null) {
                    secretKeyCache = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
                }
            }
        }
        return secretKeyCache;
    }

    // 生成访问令牌（区分记住我）
    public String generateAccessToken(Integer userId, Map<String, Object> claims) {
        return generateToken(accessExpiration, userId, claims);
    }

    // 生成刷新令牌（区分记住我）
    public String generateRefreshToken(Integer userId, boolean rememberMe) {
        long expiration = rememberMe ? rememberExpiration : refreshExpiration;
        return generateToken(expiration, userId, new HashMap<>());
    }

    // 通用令牌生成逻辑
    private String generateToken(long expiresInMillis, Integer userId, Map<String, Object> claims) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiresInMillis);

        return Jwts.builder()
                .claims(claims)
                .id(UUID.randomUUID().toString())
                .issuer("ActivitySystem")
                .issuedAt(now)
                .subject(String.valueOf(userId))
                .expiration(expiryDate)
                .signWith(getSecretKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 解析令牌获取所有声明
    public Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("令牌已过期", e);
        } catch (JwtException | IllegalArgumentException e) {
            throw new RuntimeException("无效的JWT令牌", e);
        }
    }

    // 从令牌中获取用户ID
    public Integer getUserIdFromToken(String token) {
        try {
            String subject = getClaimsFromToken(token).getSubject();
            return Integer.parseInt(subject);
        } catch (NumberFormatException e) {
            throw new RuntimeException("令牌中的用户ID格式无效", e);
        }
    }

    // 获取自定义声明
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

    // 判断是否为标准声明
    private boolean isStandardClaim(String claimName) {
        return Set.of("iss", "sub", "aud", "exp", "nbf", "iat", "jti").contains(claimName);
    }

    // 检查令牌是否过期
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getClaimsFromToken(token).getExpiration();
            return expiration.before(new Date());
        } catch (RuntimeException e) {
            return true;
        }
    }

    // 验证令牌有效性
    public boolean validateToken(String token) {
        try {
            getClaimsFromToken(token);
            return !isTokenExpired(token);
        } catch (RuntimeException e) {
            return false;
        }
    }

    // 刷新访问令牌
    public String refreshAccessToken(String refreshToken) {
        if (!validateToken(refreshToken)) {
            throw new RuntimeException("刷新令牌无效或已过期");
        }

        Integer userId = getUserIdFromToken(refreshToken);
        Map<String, Object> claims = getCustomClaims(refreshToken);

        // 从刷新令牌中提取记住我状态
        boolean rememberMe = isRememberMeFromToken(refreshToken);

        return generateAccessToken(userId, claims);
    }

    // 从令牌中提取记住我状态（通过过期时间判断）
    private boolean isRememberMeFromToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            long tokenDuration = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();
            // 如果令牌持续时间接近记住我过期时间，则认为是记住我令牌
            return Math.abs(tokenDuration - rememberExpiration) < 60000; // 1分钟容差
        } catch (Exception e) {
            return false;
        }
    }

    // 检查令牌是否即将过期
    public boolean isTokenAboutToExpire(String token, long thresholdMillis) {
        try {
            Date expiration = getClaimsFromToken(token).getExpiration();
            long timeUntilExpiry = expiration.getTime() - System.currentTimeMillis();
            return timeUntilExpiry <= thresholdMillis;
        } catch (Exception e) {
            return true;
        }
    }

    // 从请求头提取令牌
    public String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        return extractTokenFromHeader(bearerToken);
    }

    // 从Authorization头提取令牌
    public String extractTokenFromHeader(String authorizationHeader) {
        if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }

}