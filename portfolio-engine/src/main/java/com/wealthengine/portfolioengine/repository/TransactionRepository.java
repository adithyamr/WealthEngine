package com.wealthengine.portfolioengine.repository;

import com.wealthengine.portfolioengine.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdOrderByTransactionDateAsc(String userId);

    List<Transaction> findByHoldingIdOrderByTransactionDateAsc(Long holdingId);

    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND t.transactionDate BETWEEN :from AND :to ORDER BY t.transactionDate ASC")
    List<Transaction> findByUserIdAndDateRange(@Param("userId") String userId,
                                               @Param("from") LocalDate from,
                                               @Param("to") LocalDate to);
}
