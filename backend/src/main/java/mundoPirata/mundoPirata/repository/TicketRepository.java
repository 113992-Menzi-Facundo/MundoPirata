package mundoPirata.mundoPirata.repository;

import mundoPirata.mundoPirata.entity.Location;
import mundoPirata.mundoPirata.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    List<Ticket> findByAvailableTrue();
    
    List<Ticket> findByLocation(Location location);
    
    List<Ticket> findByLocationAndAvailableTrue(Location location);
    
    List<Ticket> findByDateTimeBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    Optional<Ticket> findByCode(String code);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.location = :location AND t.available = true")
    Long countAvailableByLocation(@Param("location") Location location);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.available = false")
    Long countSoldTickets();
} 