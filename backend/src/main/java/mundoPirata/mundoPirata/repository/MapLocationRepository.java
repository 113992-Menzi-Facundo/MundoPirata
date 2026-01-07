package mundoPirata.mundoPirata.repository;

import mundoPirata.mundoPirata.entity.MapLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MapLocationRepository extends JpaRepository<MapLocation, Long> {
    
    // Obtener todas las ubicaciones activas
    List<MapLocation> findByStateTrue();
    
    // Obtener todas las ubicaciones ordenadas por fecha de creación
    List<MapLocation> findAllByOrderByCreatedAtDesc();
    
    // Obtener ubicaciones activas ordenadas por fecha de creación
    List<MapLocation> findByStateTrueOrderByCreatedAtDesc();
    
    // Buscar por nombre (case insensitive)
    List<MapLocation> findByNameContainingIgnoreCase(String name);
    
    // Buscar por dirección (case insensitive)
    List<MapLocation> findByAddressContainingIgnoreCase(String address);
    
    // Obtener ubicaciones por autor
    List<MapLocation> findByAuthorId(Long authorId);
    
    // Buscar ubicaciones activas por texto (nombre, dirección o descripción)
    @Query("SELECT ml FROM MapLocation ml WHERE ml.state = true AND " +
           "(LOWER(ml.name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(ml.address) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(ml.description) LIKE LOWER(CONCAT('%', :searchText, '%')))")
    List<MapLocation> findActiveLocationsBySearchText(String searchText);
    
    // Contar ubicaciones activas
    long countByStateTrue();
} 