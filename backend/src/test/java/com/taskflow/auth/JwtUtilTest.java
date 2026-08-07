package com.taskflow.auth;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {
    @Test
    void generatedAccessTokenIsValidAndRetainsItsSubject() {
        JwtUtil jwt = new JwtUtil();
        ReflectionTestUtils.setField(jwt, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwt, "jwtExpiration", 3_600_000L);
        String token = jwt.generateToken("member@example.com");
        assertTrue(jwt.validateToken(token));
        assertEquals("member@example.com", jwt.extractEmail(token));
    }
}
