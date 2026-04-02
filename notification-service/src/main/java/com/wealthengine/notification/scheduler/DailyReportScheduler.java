package com.wealthengine.notification.scheduler;

import com.wealthengine.common.dto.PortfolioSummaryDto;
import com.wealthengine.portfolioengine.service.PortfolioService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Scheduled daily report sender.
 * Fires at 09:00 IST, Monday–Friday (before NSE opens at 09:15).
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class DailyReportScheduler {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final PortfolioService portfolioService;

    @Value("${notification.mail.from:noreply@wealthengine.com}")
    private String fromEmail;

    @Value("${notification.mail.recipient}")
    private String recipientEmail;

    /**
     * Scheduled daily report at 09:00 IST (UTC+5:30) on market days.
     */
    @Scheduled(cron = "0 0 9 * * MON-FRI", zone = "Asia/Kolkata")
    public void sendDailyReport() {
        log.info("Sending daily portfolio report to {}", recipientEmail);
        try {
            sendReport("current-user", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send daily report: {}", e.getMessage(), e);
        }
    }

    /**
     * Manually trigger a report for a specific user and recipient.
     * Used by the API for on-demand report generation.
     */
    public void sendReport(String userId, String recipient) throws Exception {
        PortfolioSummaryDto summary = portfolioService.getPortfolioSummary(userId);

        Context ctx = new Context(Locale.ENGLISH);
        ctx.setVariable("summary", summary);
        ctx.setVariable("asOf", LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")));
        ctx.setVariable("userName", "Investor");

        String htmlContent = templateEngine.process("daily-report", ctx);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(recipient);
        helper.setSubject("📊 WealthEngine Daily Report – " +
                LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        helper.setText(htmlContent, true);

        mailSender.send(message);
        log.info("Daily report sent to {}", recipient);
    }
}
