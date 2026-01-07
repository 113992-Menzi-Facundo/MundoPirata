package mundoPirata.mundoPirata.repository;

import mundoPirata.mundoPirata.entity.News;
import mundoPirata.mundoPirata.entity.NewsType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
    
    List<News> findByStateTrue();
    
    List<News> findByStateTrueOrderByDateDesc();
    
    List<News> findByType(NewsType type);
    
    List<News> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<News> findByTitleContainingIgnoreCase(String title);
} 