package com.wealthengine.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {
        "com.wealthengine.gateway",
        "com.wealthengine.portfolioengine",
        "com.wealthengine.marketdata",
        "com.wealthengine.sentiment",
        "com.wealthengine.nli",
        "com.wealthengine.agent",
        "com.wealthengine.notification"
})
@EnableScheduling
public class WealthEngineApplication {
    public static void main(String[] args) {
        SpringApplication.run(WealthEngineApplication.class, args);
    }
}
