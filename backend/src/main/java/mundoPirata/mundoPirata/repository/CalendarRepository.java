package mundoPirata.mundoPirata.repository;

import mundoPirata.mundoPirata.entity.Calendar;
import mundoPirata.mundoPirata.entity.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, Long> {
    
    List<Calendar> findByStateTrue();
    
    List<Calendar> findByStateTrueOrderByDate();
    
    List<Calendar> findByEventType(EventType eventType);
    
    List<Calendar> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Calendar> findByDate(LocalDate date);
} 