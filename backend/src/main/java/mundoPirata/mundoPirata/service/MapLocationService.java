package mundoPirata.mundoPirata.service;

import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.MapLocationCreateDTO;
import mundoPirata.mundoPirata.dto.MapLocationDTO;
import mundoPirata.mundoPirata.dto.MapLocationUpdateDTO;
import mundoPirata.mundoPirata.entity.MapLocation;
import mundoPirata.mundoPirata.entity.User;
import mundoPirata.mundoPirata.repository.MapLocationRepository;
import mundoPirata.mundoPirata.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MapLocationService {
    
    private final MapLocationRepository mapLocationRepository;
    private final UserRepository userRepository;
    
    // Obtener todas las ubicaciones activas (público)
    @Transactional(readOnly = true)
    public List<MapLocationDTO> getAllActiveLocations() {
        List<MapLocation> locations = mapLocationRepository.findByStateTrueOrderByCreatedAtDesc();
        return locations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Obtener todas las ubicaciones (admin)
    @Transactional(readOnly = true)
    public List<MapLocationDTO> getAllLocations() {
        List<MapLocation> locations = mapLocationRepository.findAllByOrderByCreatedAtDesc();
        return locations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Obtener ubicación por ID
    @Transactional(readOnly = true)
    public Optional<MapLocationDTO> getLocationById(Long id) {
        return mapLocationRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    // Crear nueva ubicación
    public MapLocationDTO createLocation(MapLocationCreateDTO createDTO) {
        // Validar que el autor existe
        User author = userRepository.findById(createDTO.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        MapLocation location = new MapLocation();
        location.setName(createDTO.getName());
        location.setAddress(createDTO.getAddress());
        location.setDescription(createDTO.getDescription());
        location.setGoogleMapsUrl(createDTO.getGoogleMapsUrl());
        location.setAuthorId(createDTO.getAuthorId());
        location.setState(true);
        
        MapLocation savedLocation = mapLocationRepository.save(location);
        return convertToDTO(savedLocation);
    }
    
    // Actualizar ubicación
    public MapLocationDTO updateLocation(Long id, MapLocationUpdateDTO updateDTO) {
        MapLocation location = mapLocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada"));
        
        // Actualizar solo los campos que no son null
        if (updateDTO.getName() != null && !updateDTO.getName().trim().isEmpty()) {
            location.setName(updateDTO.getName().trim());
        }
        
        if (updateDTO.getAddress() != null && !updateDTO.getAddress().trim().isEmpty()) {
            location.setAddress(updateDTO.getAddress().trim());
        }
        
        if (updateDTO.getDescription() != null) {
            location.setDescription(updateDTO.getDescription().trim());
        }
        
        if (updateDTO.getGoogleMapsUrl() != null && !updateDTO.getGoogleMapsUrl().trim().isEmpty()) {
            location.setGoogleMapsUrl(updateDTO.getGoogleMapsUrl().trim());
        }
        
        MapLocation savedLocation = mapLocationRepository.save(location);
        return convertToDTO(savedLocation);
    }
    
    // Cambiar estado de la ubicación (ocultar/mostrar)
    public void toggleLocationState(Long id) {
        MapLocation location = mapLocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada"));
        
        location.setState(!location.getState());
        mapLocationRepository.save(location);
    }
    
    // Eliminar ubicación (eliminación lógica)
    public void deleteLocation(Long id) {
        MapLocation location = mapLocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada"));
        
        location.setState(false);
        mapLocationRepository.save(location);
    }
    
    // Buscar ubicaciones activas por texto
    @Transactional(readOnly = true)
    public List<MapLocationDTO> searchActiveLocations(String searchText) {
        List<MapLocation> locations = mapLocationRepository.findActiveLocationsBySearchText(searchText);
        return locations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Obtener ubicaciones por autor
    @Transactional(readOnly = true)
    public List<MapLocationDTO> getLocationsByAuthor(Long authorId) {
        List<MapLocation> locations = mapLocationRepository.findByAuthorId(authorId);
        return locations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Obtener estadísticas
    @Transactional(readOnly = true)
    public long getActiveLocationsCount() {
        return mapLocationRepository.countByStateTrue();
    }
    
    // Convertir entidad a DTO
    private MapLocationDTO convertToDTO(MapLocation location) {
        // Obtener el nombre del autor
        String authorName = userRepository.findById(location.getAuthorId())
                .map(user -> user.getName() + " " + user.getLastName())
                .orElse("Usuario no encontrado");
        
        return new MapLocationDTO(
                location.getId(),
                location.getName(),
                location.getAddress(),
                location.getDescription(),
                location.getGoogleMapsUrl(),
                location.getAuthorId(),
                authorName,
                location.getState(),
                location.getCreatedAt(),
                location.getUpdatedAt()
        );
    }
} 