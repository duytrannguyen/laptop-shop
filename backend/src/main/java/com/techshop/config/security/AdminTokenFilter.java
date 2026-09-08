package com.techshop.config.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AdminTokenFilter extends OncePerRequestFilter {
    private final AdminTokenService tokenService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Chỉ kiểm tra token với các request vào /api/admin/ (bỏ qua OPTIONS preflight)
        if (!"OPTIONS".equalsIgnoreCase(request.getMethod())
                && request.getRequestURI().startsWith("/api/admin/")) {

            String authorization = request.getHeader("Authorization");
            // Lấy token từ header hoặc query param (query param dùng cho SSE vì EventSource không set header)
            String token = authorization != null && authorization.startsWith("Bearer ")
                    ? authorization.substring(7) : request.getParameter("token");

            if (token == null || !tokenService.isValid(token)) {
                // Token không hợp lệ → từ chối request
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                response.getWriter().write("{\"message\":\"Phiên đăng nhập không hợp lệ hoặc đã hết hạn\"}");
                return;
            }

            // Token hợp lệ → gắn quyền ADMIN vào SecurityContext
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("admin", null,
                            List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
        }

        chain.doFilter(request, response);
    }
}
