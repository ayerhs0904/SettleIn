package com.settlein.backend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
@Slf4j
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username:}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Value("${spring.datasource.hikari.maximum-pool-size:10}")
    private int maxPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:2}")
    private int minIdle;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName(driverClassName);

        String finalJdbcUrl = rawUrl;
        String finalUsername = username;
        String finalPassword = password;

        // Auto-detect and convert Render/Heroku/Supabase "postgres://" or "postgresql://" URL schemas
        if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
            log.info("Detected standard URI database format (postgres://). Converting to JDBC format for production...");
            try {
                // Ensure URI can be parsed even with postgres:// scheme
                String uriString = rawUrl.startsWith("postgresql://") ? rawUrl.replace("postgresql://", "http://") : rawUrl.replace("postgres://", "http://");
                URI uri = new URI(uriString);

                String host = uri.getHost();
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath(); // includes leading '/'
                String database = (path != null && path.length() > 1) ? path.substring(1) : "postgres";

                String query = uri.getQuery();
                StringBuilder jdbcUrlBuilder = new StringBuilder("jdbc:postgresql://")
                        .append(host)
                        .append(":")
                        .append(port)
                        .append("/")
                        .append(database);

                if (query != null && !query.isEmpty()) {
                    jdbcUrlBuilder.append("?").append(query);
                }

                finalJdbcUrl = jdbcUrlBuilder.toString();

                // Extract credentials from userInfo if provided
                if (uri.getUserInfo() != null) {
                    String[] userInfoParts = uri.getUserInfo().split(":", 2);
                    if (userInfoParts.length > 0 && (finalUsername == null || finalUsername.isEmpty())) {
                        finalUsername = userInfoParts[0];
                    }
                    if (userInfoParts.length > 1 && (finalPassword == null || finalPassword.isEmpty())) {
                        finalPassword = userInfoParts[1];
                    }
                }
                log.info("Successfully converted database connection to JDBC target host: {}:{}", host, port);
            } catch (Exception e) {
                log.warn("Could not parse database URI. Falling back to raw URL string: {}", e.getMessage());
            }
        }

        config.setJdbcUrl(finalJdbcUrl);
        if (finalUsername != null && !finalUsername.isEmpty()) {
            config.setUsername(finalUsername);
        }
        if (finalPassword != null && !finalPassword.isEmpty()) {
            config.setPassword(finalPassword);
        }

        // Production Hikari Pool Tuning
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setIdleTimeout(30000);
        config.setConnectionTimeout(20000);
        config.setMaxLifetime(1800000);
        config.setPoolName("SettleIn-HikariPool");

        return new HikariDataSource(config);
    }
}
