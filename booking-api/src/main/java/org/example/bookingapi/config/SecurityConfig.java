package org.example.bookingapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 配置类
 * 禁用默认的安全配置，仅使用BCrypt进行密码加密
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 禁用CSRF保护（因为是API项目）
            .csrf(csrf -> csrf.disable())
            // 允许所有请求访问
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )
            // 禁用默认登录页面
            .formLogin(form -> form.disable())
            // 禁用HTTP Basic认证
            .httpBasic(basic -> basic.disable());
            
        return http.build();
    }
}