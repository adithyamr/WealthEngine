@agent I want to build 'WealthEngine', a high-integrity financial analysis platform. 
Follow a strict 3-Tier architecture (80% Deterministic, 15% Augmented, 5% Agentic).

### 1. Project Structure & Tech Stack
- Backend: Java 21, Spring Boot 3.4+, Spring AI, Hibernate.
- Frontend: Angular 19 (using NgRx for state and Tailwind for UI).
- Database: PostgreSQL with PGVector.
- Methodology: Maven Multi-module to enforce architectural boundaries.

### 2. TIER 1: DETERMINISTIC CORE (The "Source of Truth")
- 'market-data-service': Implement Dhan/Upstox API wrappers using RestClient. Use Resilience4j for circuit breakers and Caffeine for caching live NSE ticks.
- 'portfolio-engine': 
    - Implement a 'PortfolioService' that handles: Stocks, Mutual Funds, ETFs, PPF, FD, NPS, and EPF.
    - Write a Newton-Raphson XIRR algorithm using BigDecimal.
    - Logic for sector concentration and rebalancing (Asset vs. Debt vs. Cash).
- 'notification-service': Spring Mail + Thymeleaf for daily 9:00 AM IST reports.

### 3. TIER 2: LLM-AUGMENTED (The "Data Synthesizer")
- 'sentiment-pipeline': RAG flow using PGVector. Scrape 'MoneyControl' and 'Economic Times' for daily news. Use QuestionAnswerAdvisor for "What is the sentiment for [Ticker]?"
- 'nli-interface': Use Spring AI Tool Calling to map natural language queries (e.g., "What is my total NPS balance?") directly to 'portfolio-engine' methods.

### 4. TIER 3: AGENTIC REASONING (The "Deep-Dive Analyst")
- 'analysis-agent': A ChatClient with an Advisor chain that performs multi-step reasoning.
    - Use Case: "Should I buy [Ticker] given my current portfolio?"
    - Plan: (1) Fetch Tier 1 market data, (2) Fetch Tier 2 news sentiment, (3) Check Tier 1 portfolio concentration, (4) Synthesize recommendation with a reasoning trace.

### 5. UI & DASHBOARD (Angular 19)
- 'NetWorthComponent': A Treemap visualization showing the hierarchy: Stocks > MF > NPS > EPF > PPF > FD.
- 'LiveConsole': A dynamic input for real-time stock/option deep-dives.
- 'DailyRecsComponent': List of daily AI-generated recommendations based on the watchlist.

### 6. EXECUTION STEPS
1. Create the design-spec.md and Maven pom.xml first.
2. Build the 'portfolio-engine' with unit tests for XIRR.
3. Use your browser to verify the latest Dhan API v3 endpoint for NSE live ticks.
4. Scaffold the Angular frontend and connect it to the Backend.