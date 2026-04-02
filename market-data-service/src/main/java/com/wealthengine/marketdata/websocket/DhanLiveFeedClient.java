package com.wealthengine.marketdata.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wealthengine.common.dto.MarketTickDto;
import com.wealthengine.common.enums.ExchangeSegment;
import com.wealthengine.marketdata.config.DhanConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

import jakarta.annotation.PreDestroy;
import java.math.BigDecimal;
import java.net.URI;
import java.nio.ByteBuffer;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Consumer;

/**
 * DhanWebSocketClient connects to `wss://api-feed.dhan.co` and streams
 * real-time NSE market ticks in binary format.
 *
 * Protocol Notes:
 * - Connection params: version=2, token={accessToken}, clientId={clientId}, authType=2
 * - Subscription: JSON message with RequestCode=15 and InstrumentList
 * - Response: Binary packet (parsed according to DhanHQ Live Feed v2 spec)
 *
 * Binary Packet Layout (67 bytes for Full packet):
 * Offset  Size  Field
 * 0       1     Response Code
 * 1       2     Exchange Segment
 * 3       4     Security ID
 * 7       4     LTP (float * 100 = paise)
 * 11      4     LTQ
 * 15      8     LTT (unix epoch ms)
 * 23      8     Avg Trade Price
 * 31      4     Volume
 * ...     ...   (OHLC follows in extended packets)
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class DhanLiveFeedClient {

    private final DhanConfig dhanConfig;
    private final ObjectMapper objectMapper;

    private WebSocketSession session;
    private final List<Consumer<MarketTickDto>> tickListeners = new CopyOnWriteArrayList<>();
    private final Set<String> subscribedSecurities = ConcurrentHashMap.newKeySet();
    private ScheduledExecutorService reconnectScheduler;

    public void connect() {
        reconnectScheduler = Executors.newSingleThreadScheduledExecutor();
        attemptConnect();
    }

    private void attemptConnect() {
        String url = String.format("%s?version=2&token=%s&clientId=%s&authType=2",
                dhanConfig.getWsFeedUrl(),
                dhanConfig.getAccessToken(),
                dhanConfig.getClientId());
        try {
            StandardWebSocketClient client = new StandardWebSocketClient();
            client.execute(new DhanWebSocketHandler(), url);
            log.info("Dhan WebSocket connection initiated to {}", dhanConfig.getWsFeedUrl());
        } catch (Exception e) {
            log.error("Failed to connect to Dhan WebSocket: {}. Retrying in {}s",
                    e.getMessage(), dhanConfig.getWsReconnectDelaySeconds());
            scheduleReconnect();
        }
    }

    /**
     * Subscribes to live ticks for a list of securities.
     *
     * @param instruments Map of ExchangeSegment code → List of SecurityIDs
     */
    public void subscribe(Map<String, List<String>> instruments) {
        if (session == null || !session.isOpen()) {
            log.warn("WebSocket not connected, queueing subscription");
            return;
        }
        try {
            List<Map<String, String>> instrumentList = new ArrayList<>();
            for (Map.Entry<String, List<String>> entry : instruments.entrySet()) {
                for (String securityId : entry.getValue()) {
                    instrumentList.add(Map.of(
                            "ExchangeSegment", entry.getKey(),
                            "SecurityId", securityId
                    ));
                    subscribedSecurities.add(entry.getKey() + ":" + securityId);
                }
            }

            Map<String, Object> subscriptionMsg = Map.of(
                    "RequestCode", 15,                    // Full packet code
                    "InstrumentCount", instrumentList.size(),
                    "InstrumentList", instrumentList
            );

            String json = objectMapper.writeValueAsString(subscriptionMsg);
            session.sendMessage(new TextMessage(json));
            log.info("Subscribed to {} instruments on Dhan live feed", instrumentList.size());
        } catch (Exception e) {
            log.error("Failed to send subscription: {}", e.getMessage(), e);
        }
    }

    public void addTickListener(Consumer<MarketTickDto> listener) {
        tickListeners.add(listener);
    }

    private void scheduleReconnect() {
        reconnectScheduler.schedule(this::attemptConnect,
                dhanConfig.getWsReconnectDelaySeconds(), TimeUnit.SECONDS);
    }

    @PreDestroy
    public void disconnect() {
        try {
            if (session != null && session.isOpen()) {
                session.close();
            }
            if (reconnectScheduler != null) {
                reconnectScheduler.shutdownNow();
            }
        } catch (Exception e) {
            log.error("Error closing Dhan WebSocket: {}", e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WebSocket Handler (inner class)
    // ─────────────────────────────────────────────────────────────────────────

    private class DhanWebSocketHandler extends BinaryWebSocketHandler {

        @Override
        public void afterConnectionEstablished(WebSocketSession newSession) {
            session = newSession;
            log.info("✅ Connected to Dhan Live Market Feed");
            // Re-subscribe previously tracked instruments on reconnect
            if (!subscribedSecurities.isEmpty()) {
                Map<String, List<String>> resubscribeMap = new HashMap<>();
                for (String key : subscribedSecurities) {
                    String[] parts = key.split(":");
                    resubscribeMap.computeIfAbsent(parts[0], k -> new ArrayList<>()).add(parts[1]);
                }
                subscribe(resubscribeMap);
            }
        }

        @Override
        protected void handleBinaryMessage(WebSocketSession sess, BinaryMessage message) {
            try {
                MarketTickDto tick = parseBinaryPacket(message.getPayload());
                if (tick != null) {
                    tickListeners.forEach(listener -> listener.accept(tick));
                }
            } catch (Exception e) {
                log.error("Error parsing binary market tick: {}", e.getMessage());
            }
        }

        @Override
        public void handleTransportError(WebSocketSession sess, Throwable exception) {
            log.error("Dhan WebSocket transport error: {}", exception.getMessage());
            scheduleReconnect();
        }

        @Override
        public void afterConnectionClosed(WebSocketSession sess, CloseStatus status) {
            log.warn("Dhan WebSocket closed: {}. Reconnecting...", status);
            scheduleReconnect();
        }
    }

    /**
     * Parses the binary market data packet from Dhan Live Feed.
     * Based on DhanHQ API v2 binary protocol specification.
     *
     * Format (minimum 7 bytes for header, extended for OHLC/depth):
     * Byte 0     : Response code (15 = Quote/Full packet)
     * Bytes 1-2  : Exchange Segment (short)
     * Bytes 3-6  : Security ID (int)
     * Bytes 7-10 : LTP (float, in paise - divide by 100)
     */
    private MarketTickDto parseBinaryPacket(ByteBuffer payload) {
        if (payload.remaining() < 11) return null;  // Too short

        byte responseCode = payload.get();          // Byte 0
        short exchangeCode = payload.getShort();    // Bytes 1-2
        int securityId = payload.getInt();          // Bytes 3-6
        float ltpPaise = payload.getFloat();        // Bytes 7-10

        BigDecimal ltp = BigDecimal.valueOf(ltpPaise / 100.0);

        // Extended fields (optional, present in Quote/Full packets)
        BigDecimal open = BigDecimal.ZERO, high = BigDecimal.ZERO,
                low = BigDecimal.ZERO, close = BigDecimal.ZERO;
        long volume = 0;

        if (payload.remaining() >= 28) {
            payload.getInt();                           // LTQ
            payload.getLong();                          // LTT (epoch ms)
            payload.getDouble();                        // Avg trade price
            volume = payload.getInt();
        }
        if (payload.remaining() >= 16) {
            open = BigDecimal.valueOf(payload.getFloat() / 100.0);
            high = BigDecimal.valueOf(payload.getFloat() / 100.0);
            low = BigDecimal.valueOf(payload.getFloat() / 100.0);
            close = BigDecimal.valueOf(payload.getFloat() / 100.0);
        }

        ExchangeSegment segment = resolveExchangeSegment(exchangeCode);

        return MarketTickDto.builder()
                .securityId(String.valueOf(securityId))
                .exchangeSegment(segment)
                .lastTradedPrice(ltp)
                .openPrice(open)
                .highPrice(high)
                .lowPrice(low)
                .closePrice(close)
                .volume(volume)
                .changeAbsolute(ltp.subtract(close))
                .changePercent(close.compareTo(BigDecimal.ZERO) != 0
                        ? ltp.subtract(close).divide(close, 4, java.math.RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                        : BigDecimal.ZERO)
                .timestamp(Instant.now())
                .build();
    }

    private ExchangeSegment resolveExchangeSegment(short code) {
        return switch (code) {
            case 1 -> ExchangeSegment.NSE_EQ;
            case 2 -> ExchangeSegment.NSE_FNO;
            case 3 -> ExchangeSegment.BSE_EQ;
            case 7 -> ExchangeSegment.MCX_COMM;
            default -> ExchangeSegment.NSE_EQ;
        };
    }
}
