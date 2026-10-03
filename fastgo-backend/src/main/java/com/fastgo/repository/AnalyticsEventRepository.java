package com.fastgo.repository;

import com.fastgo.entity.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    boolean existsByAnonymousIdAndEventType(String anonymousId, String eventType);

    List<AnalyticsEvent> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    List<AnalyticsEvent> findAllByOrderByCreatedAtDesc();

    long countByEventType(String eventType);

    long countByEventTypeAndCreatedAtBetween(String eventType, LocalDateTime start, LocalDateTime end);

    @Query("SELECT e.eventType, COUNT(e) FROM AnalyticsEvent e WHERE e.createdAt BETWEEN :start AND :end GROUP BY e.eventType")
    List<Object[]> countByEventTypeGrouped(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT e.eventType, COUNT(e) FROM AnalyticsEvent e GROUP BY e.eventType")
    List<Object[]> countByEventTypeGroupedAll();

    @Query("SELECT e.source, COUNT(e) FROM AnalyticsEvent e WHERE e.createdAt BETWEEN :start AND :end AND e.source IS NOT NULL GROUP BY e.source ORDER BY COUNT(e) DESC")
    List<Object[]> countBySource(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
