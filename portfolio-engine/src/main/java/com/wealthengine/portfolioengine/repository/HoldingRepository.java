package com.wealthengine.portfolioengine.repository;

import com.wealthengine.common.enums.AssetType;
import com.wealthengine.portfolioengine.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, Long> {

    List<Holding> findByUserIdAndActiveTrue(String userId);

    List<Holding> findByUserIdAndAssetTypeAndActiveTrue(String userId, AssetType assetType);

    @Query("SELECT h FROM Holding h WHERE h.userId = :userId AND h.active = true ORDER BY h.assetType, h.name")
    List<Holding> findAllActiveForUser(@Param("userId") String userId);

    @Query("SELECT DISTINCT h.sector FROM Holding h WHERE h.userId = :userId AND h.active = true AND h.sector IS NOT NULL")
    List<String> findDistinctSectorsByUser(@Param("userId") String userId);

    @Query("SELECT h FROM Holding h WHERE h.userId = :userId AND h.sector = :sector AND h.active = true")
    List<Holding> findBySector(@Param("userId") String userId, @Param("sector") String sector);
}
