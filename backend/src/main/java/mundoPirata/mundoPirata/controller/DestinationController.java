package mundoPirata.mundoPirata.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.DestinationCreateDTO;
import mundoPirata.mundoPirata.dto.DestinationDTO;
import mundoPirata.mundoPirata.dto.DonationStatsDTO;
import mundoPirata.mundoPirata.entity.Destination;
import mundoPirata.mundoPirata.service.DestinationService;
import mundoPirata.mundoPirata.service.DonationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Destinaciones", description = "Gestión de destinaciones para donaciones")
public class DestinationController {
    
    private final DestinationService destinationService;
    private final DonationService donationService;
    
    // Endpoints públicos
    @GetMapping("/public")
    @Operation(summary = "Obtener destinaciones activas", description = "Retorna todas las destinaciones habilitadas para donaciones - Acceso público")
    @ApiResponse(responseCode = "200", description = "Lista de destinaciones activas")
    public ResponseEntity<List<DestinationDTO>> getActiveDestinations() {
        List<DestinationDTO> destinations = destinationService.getActiveDestinations();
        return ResponseEntity.ok(destinations);
    }
    
    // Endpoints administrativos
    @GetMapping
    @Operation(summary = "Obtener todas las destinaciones", description = "Retorna todas las destinaciones del sistema - Solo administradores")
    public ResponseEntity<List<DestinationDTO>> getAllDestinations() {
        List<DestinationDTO> destinations = destinationService.getAllDestinations();
        return ResponseEntity.ok(destinations);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener destinación por ID", description = "Retorna una destinación específica por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Destinación encontrada"),
        @ApiResponse(responseCode = "404", description = "Destinación no encontrada")
    })
    public ResponseEntity<DestinationDTO> getDestinationById(@Parameter(description = "ID de la destinación") @PathVariable Long id) {
        return destinationService.getDestinationById(id)
                .map(destination -> ResponseEntity.ok(destination))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @Operation(summary = "Crear nueva destinación", description = "Crea una nueva destinación en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Destinación creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Error en los datos de la destinación")
    })
    public ResponseEntity<DestinationDTO> createDestination(@Valid @RequestBody DestinationCreateDTO destinationCreateDTO) {
        try {
            DestinationDTO createdDestination = destinationService.createDestination(destinationCreateDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDestination);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar destinación", description = "Actualiza una destinación existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Destinación actualizada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Destinación no encontrada"),
        @ApiResponse(responseCode = "400", description = "Error en los datos de la destinación")
    })
    public ResponseEntity<DestinationDTO> updateDestination(
            @Parameter(description = "ID de la destinación") @PathVariable Long id,
            @Valid @RequestBody DestinationDTO destinationDTO) {
        try {
            DestinationDTO updatedDestination = destinationService.updateDestination(id, destinationDTO);
            return ResponseEntity.ok(updatedDestination);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/toggle")
    @Operation(summary = "Cambiar estado de destinación", description = "Activa o desactiva una destinación")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estado cambiado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Destinación no encontrada")
    })
    public ResponseEntity<DestinationDTO> toggleDestinationState(@Parameter(description = "ID de la destinación") @PathVariable Long id) {
        try {
            DestinationDTO updatedDestination = destinationService.toggleDestinationState(id);
            return ResponseEntity.ok(updatedDestination);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar destinación", description = "Elimina una destinación del sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Destinación eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Destinación no encontrada"),
        @ApiResponse(responseCode = "409", description = "No se puede eliminar: destinación tiene donaciones asociadas")
    })
    public ResponseEntity<Void> deleteDestination(@Parameter(description = "ID de la destinación") @PathVariable Long id) {
        try {
            destinationService.deleteDestination(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            // Destinación tiene donaciones asociadas
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/stats")
    @Operation(summary = "Obtener estadísticas de donaciones", description = "Retorna estadísticas de donaciones por destinación - Solo administradores")
    public ResponseEntity<DonationStatsDTO> getDonationStats() {
        DonationStatsDTO stats = donationService.getDonationStatistics();
        return ResponseEntity.ok(stats);
    }
} 