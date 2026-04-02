package com.wealthengine.marketdata.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Dhan API configuration properties.
 * Loaded from application.yml / environment variables.
 */
@Component
@ConfigurationProperties(prefix = "dhan")
@Data
public class DhanConfig {
    private String clientId;
    private String accessToken;
    private String baseUrl = "https://api.dhan.co";
    private String wsFeedUrl = "wss://api-feed.dhan.co";
    private int wsReconnectDelaySeconds = 5;
    private int snapshotTimeoutMs = 5000;
}
