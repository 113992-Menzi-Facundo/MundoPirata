package mundoPirata.mundoPirata.repository;

import mundoPirata.mundoPirata.entity.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventTypeRepository extends JpaRepository<EventType, Long> {
    
} 