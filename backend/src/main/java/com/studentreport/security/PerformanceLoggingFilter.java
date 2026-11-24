package com.studentreport.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PerformanceLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(PerformanceLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String correlationId = request.getHeader("X-Correlation-ID");
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString().substring(0, 8);
        }

        long startTime = System.currentTimeMillis();
        response.setHeader("X-Correlation-ID", correlationId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            response.setHeader("X-Response-Time-Ms", String.valueOf(duration));

            String uri = request.getRequestURI();
            // Don't log favicon or static assets
            if (!uri.endsWith(".ico") && !uri.endsWith(".css") && !uri.endsWith(".js")) {
                int status = response.getStatus();
                if (duration > 500) {
                    log.warn("[PERF-SLOW] [{}] {} {} -> HTTP {} ({}ms)",
                            correlationId, request.getMethod(), uri, status, duration);
                } else {
                    log.info("[PERF] [{}] {} {} -> HTTP {} ({}ms)",
                            correlationId, request.getMethod(), uri, status, duration);
                }
            }
        }
    }
}
