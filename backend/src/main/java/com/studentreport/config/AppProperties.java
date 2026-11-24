package com.studentreport.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {
    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();
    private Seed seed = new Seed();

    @Data
    public static class Jwt {
        private String secret;
        private Long expirationMs;
        private String cookieName;
        private Boolean cookieSecure;
        private String cookieSameSite;
    }

    @Data
    public static class Cors {
        private String allowedOrigins;
    }

    @Data
    public static class Seed {
        private boolean enabled;
    }
}
