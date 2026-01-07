package mundoPirata.mundoPirata.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.entity.EventType;
import mundoPirata.mundoPirata.repository.EventTypeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Tipos de Eventos", description = "Gestión de tipos de eventos del calendario")
public class EventTypeController {
    
    private final EventTypeRepository eventTypeRepository;
    
    @GetMapping
    @Operation(summary = "Obtener todos los tipos de eventos", description = "Retorna la lista completa de tipos de eventos disponibles")
    @ApiResponse(responseCode = "200", description = "Lista de tipos de eventos")
    public ResponseEntity<List<EventType>> getAllEventTypes() {
        List<EventType> eventTypes = eventTypeRepository.findAll();
        return ResponseEntity.ok(eventTypes);
    }
} 