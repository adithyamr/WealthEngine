package com.wealthengine.sentiment.scraper;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Scrapes MoneyControl and Economic Times for financial news.
 * Uses Jsoup to parse RSS feeds for reliability and politeness.
 */
@Component
@Slf4j
public class NewsScraperService {

    // MoneyControl RSS feeds (publicly available)
    private static final String MONEYCONTROL_MARKETS_RSS = "https://www.moneycontrol.com/rss/marketreports.xml";
    private static final String MONEYCONTROL_STOCKS_RSS   = "https://www.moneycontrol.com/rss/latestnews.xml";

    // Economic Times RSS feeds
    private static final String ET_MARKETS_RSS  = "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms";
    private static final String ET_ECONOMY_RSS  = "https://economictimes.indiatimes.com/economy/rssfeeds/1373380680.cms";

    private static final String USER_AGENT =
            "WealthEngine/1.0 (financial analysis; contact: admin@wealthengine.com)";
    private static final int TIMEOUT_MS = 8_000;

    /**
     * Fetches news articles related to a specific stock ticker.
     *
     * @param ticker NSE ticker symbol (e.g., "INFY", "RELIANCE")
     * @return List of news articles as plain text (title + summary)
     */
    public List<NewsArticle> fetchNewsForTicker(String ticker) {
        List<NewsArticle> articles = new ArrayList<>();
        articles.addAll(scrapeRssFeed(MONEYCONTROL_MARKETS_RSS, ticker, "MoneyControl"));
        articles.addAll(scrapeRssFeed(MONEYCONTROL_STOCKS_RSS, ticker, "MoneyControl"));
        articles.addAll(scrapeRssFeed(ET_MARKETS_RSS, ticker, "EconomicTimes"));
        articles.addAll(scrapeRssFeed(ET_ECONOMY_RSS, ticker, "EconomicTimes"));

        log.info("Fetched {} news articles for ticker={}", articles.size(), ticker);
        return articles;
    }

    /**
     * Fetches all recent market news (for daily ingestion into PGVector).
     */
    public List<NewsArticle> fetchAllMarketNews() {
        List<NewsArticle> articles = new ArrayList<>();
        articles.addAll(scrapeRssFeed(MONEYCONTROL_MARKETS_RSS, null, "MoneyControl"));
        articles.addAll(scrapeRssFeed(ET_MARKETS_RSS, null, "EconomicTimes"));
        log.info("Fetched {} total market news articles", articles.size());
        return articles;
    }

    private List<NewsArticle> scrapeRssFeed(String feedUrl, String filterTicker, String source) {
        List<NewsArticle> articles = new ArrayList<>();
        try {
            Document doc = Jsoup.connect(feedUrl)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .get();

            Elements items = doc.select("item");
            for (Element item : items) {
                String title = item.select("title").text();
                String description = item.select("description").text();
                String pubDate = item.select("pubDate").text();
                String link = item.select("link").text();

                // Filter by ticker if specified (case-insensitive title/desc match)
                if (filterTicker != null &&
                        !title.toUpperCase().contains(filterTicker.toUpperCase()) &&
                        !description.toUpperCase().contains(filterTicker.toUpperCase())) {
                    continue;
                }

                articles.add(new NewsArticle(title, description, source, pubDate, link, filterTicker));
            }
        } catch (IOException e) {
            log.warn("Failed to scrape RSS feed {}: {}", feedUrl, e.getMessage());
        }
        return articles;
    }

    /**
     * Represents a scraped news article.
     */
    public record NewsArticle(
            String title,
            String content,
            String source,
            String publishedDate,
            String url,
            String ticker  // null if general market news
    ) {
        /**
         * Returns a plain text representation for embedding.
         */
        public String toEmbeddingText() {
            return "Source: " + source + "\n" +
                   "Date: " + publishedDate + "\n" +
                   "Title: " + title + "\n" +
                   "Content: " + content;
        }
    }
}
