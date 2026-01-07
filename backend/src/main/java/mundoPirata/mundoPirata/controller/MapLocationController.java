package mundoPirata.mundoPirata.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.MapLocationCreateDTO;
import mundoPirata.mundoPirata.dto.MapLocationDTO;
import mundoPirata.mundoPirata.dto.MapLocationUpdateDTO;
import mundoPirata.mundoPirata.service.MapLocationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/map-locations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Ubicaciones del Mapa", description = "Gestión de lugares y ubicaciones del mapa del club")
public class MapLocationController {
    
    private final MapLocationService mapLocationService;
    
    // Endpoints públicos
    @GetMapping("/public")
    @Operation(summary = "Obtener ubicaciones activas", description = "Retorna todas las ubicaciones activas para mostrar en el mapa público")
    @ApiResponse(responseCode = "200", description = "Lista de ubicaciones activas")
    public ResponseEntity<List<MapLocationDTO>> getAllActiveLocations() {
        List<MapLocationDTO> locations = mapLocationService.getAllActiveLocations();
        return ResponseEntity.ok(locations);
    }
    
    @GetMapping("/public/{id}")
    @Operation(summary = "Obtener ubicación por ID", description = "Retorna una ubicación específica por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Ubicación encontrada"),
        @ApiResponse(responseCode = "404", description = "Ubicación no encontrada")
    })
    public ResponseEntity<MapLocationDTO> getLocationById(@Parameter(description = "ID de la ubicación") @PathVariable Long id) {
        return mapLocationService.getLocationById(id)
                .map(location -> ResponseEntity.ok(location))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/public/search")
    @Operation(summary = "Buscar ubicaciones", description = "Busca ubicaciones activas por nombre, dirección o descripción")
    @ApiResponse(responseCode = "200", description = "Lista de ubicaciones encontradas")
    public ResponseEntity<List<MapLocationDTO>> searchActiveLocations(
            @Parameter(description = "Texto a buscar") @RequestParam String q) {
        List<MapLocationDTO> locations = mapLocationService.searchActiveLocations(q);
        return ResponseEntity.ok(locations);
    }
    
    // Endpoints administrativos
    @GetMapping
    @Operation(summary = "Obtener todas las ubicaciones", description = "Retorna todas las ubicaciones (activas e inactivas) - Solo administradores")
    public ResponseEntity<List<MapLocationDTO>> getAllLocations() {
        List<MapLocationDTO> locations = mapLocationService.getAllLocations();
        return ResponseEntity.ok(locations);
    }
    
    @PostMapping
    @Operation(summary = "Crear nueva ubicación", description = "Crea una nueva ubicación en el mapa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Ubicación creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Error en los datos de la ubicación")
    })
    public ResponseEntity<MapLocationDTO> createLocation(@Valid @RequestBody MapLocationCreateDTO createDTO) {
        try {
            MapLocationDTO createdLocation = mapLocationService.createLocation(createDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdLocation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar ubicación", description = "Actualiza una ubicación existente. Todos los campos son opcionales.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Ubicación actualizada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Ubicación no encontrada")
    })
    public ResponseEntity<MapLocationDTO> updateLocation(
            @Parameter(description = "ID de la ubicación") @PathVariable Long id,
            @Valid @RequestBody MapLocationUpdateDTO updateDTO) {
        try {
            MapLocationDTO updatedLocation = mapLocationService.updateLocation(id, updateDTO);
            return ResponseEntity.ok(updatedLocation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/toggle-state")
    @Operation(summary = "Cambiar estado de ubicación", description = "Oculta o muestra una ubicación en el mapa público")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estado cambiado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Ubicación no encontrada")
    })
    public ResponseEntity<Void> toggleLocationState(@Parameter(description = "ID de la ubicación") @PathVariable Long id) {
        try {
            mapLocationService.toggleLocationState(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar ubicación", description = "Marca una ubicación como inactiva (eliminación lógica)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Ubicación eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Ubicación no encontrada")
    })
    public ResponseEntity<Void> deleteLocation(@Parameter(description = "ID de la ubicación") @PathVariable Long id) {
        try {
            mapLocationService.deleteLocation(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/author/{authorId}")
    @Operation(summary = "Obtener ubicaciones por autor", description = "Retorna todas las ubicaciones creadas por un autor específico")
    public ResponseEntity<List<MapLocationDTO>> getLocationsByAuthor(
            @Parameter(description = "ID del autor") @PathVariable Long authorId) {
        List<MapLocationDTO> locations = mapLocationService.getLocationsByAuthor(authorId);
        return ResponseEntity.ok(locations);
    }
    
    @GetMapping("/stats/count")
    @Operation(summary = "Obtener cantidad de ubicaciones activas", description = "Retorna el número total de ubicaciones activas")
    public ResponseEntity<Long> getActiveLocationsCount() {
        long count = mapLocationService.getActiveLocationsCount();
        return ResponseEntity.ok(count);
    }
} 