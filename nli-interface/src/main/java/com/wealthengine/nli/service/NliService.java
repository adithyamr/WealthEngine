package com.wealthengine.nli.service;

import com.wealthengine.nli.tools.PortfolioTools;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.stereotype.Service;

/**
 * Natural Language Interface service.
 * Accepts plain English queries about the portfolio and calls PortfolioTools via Spring AI Tool Calling.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NliService {

    private final ChatClient.Builder chatClientBuilder;
    private final PortfolioTools portfolioTools;

    private static final String SYSTEM_PROMPT = """
            You are WealthEngine, a personal financial assistant for Indian retail investors.
            You have access to real portfolio data tools. Answer user questions accurately
            using the available tools. Always:
            - Use Indian currency (₹)
            - Provide clear, concise financial insights
            - If data is unavailable, say so honestly
            - Never hallucinate portfolio values or returns
            """;

    /**
     * Processes a natural language portfolio query.
     *
     * @param userQuery   Natural language question (e.g., "What is my total NPS balance?")
     * @return LLM-generated response backed by real portfolio data
     */
    public String query(String userQuery) {
        log.info("NLI query: {}", userQuery);

        return chatClientBuilder
                .defaultSystem(SYSTEM_PROMPT)
                .defaultTools(portfolioTools)
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .build()
                .prompt(userQuery)
                .call()
                .content();
    }
}
