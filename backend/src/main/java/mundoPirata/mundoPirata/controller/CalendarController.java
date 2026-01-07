package mundoPirata.mundoPirata.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.CalendarDTO;
import mundoPirata.mundoPirata.dto.CalendarCreateDTO;
import mundoPirata.mundoPirata.dto.CalendarUpdateDTO;
import mundoPirata.mundoPirata.service.CalendarService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Calendario", description = "Gestión de eventos y calendario del club")
public class CalendarController {
    
    private final CalendarService calendarService;
    
    // Endpoints públicos
    @GetMapping("/public")
    @Operation(summary = "Obtener eventos activos", description = "Retorna todos los eventos activos ordenados por fecha")
    @ApiResponse(responseCode = "200", description = "Lista de eventos activos")
    public ResponseEntity<List<CalendarDTO>> getAllActiveEvents() {
        List<CalendarDTO> events = calendarService.getAllActiveEvents();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/public/{id}")
    @Operation(summary = "Obtener evento por ID", description = "Retorna un evento específico por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Evento encontrado"),
        @ApiResponse(responseCode = "404", description = "Evento no encontrado")
    })
    public ResponseEntity<CalendarDTO> getEventById(@Parameter(description = "ID del evento") @PathVariable Long id) {
        return calendarService.getEventById(id)
                .map(event -> ResponseEntity.ok(event))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/public/upcoming")
    @Operation(summary = "Obtener próximos eventos", description = "Retorna eventos activos de los próximos 3 meses")
    @ApiResponse(responseCode = "200", description = "Lista de próximos eventos")
    public ResponseEntity<List<CalendarDTO>> getUpcomingEvents() {
        List<CalendarDTO> events = calendarService.getUpcomingEvents();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/public/date/{date}")
    @Operation(summary = "Obtener eventos por fecha", description = "Retorna todos los eventos de una fecha específica")
    @ApiResponse(responseCode = "200", description = "Lista de eventos de la fecha")
    public ResponseEntity<List<CalendarDTO>> getEventsByDate(
            @Parameter(description = "Fecha en formato YYYY-MM-DD") 
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<CalendarDTO> events = calendarService.getEventsByDate(date);
        return ResponseEntity.ok(events);
    }
    
    // Endpoints administrativos
    @PostMapping
    @Operation(summary = "Crear nuevo evento", description = "Crea un nuevo evento en el calendario")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Evento creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Error en los datos del evento")
    })
    public ResponseEntity<CalendarDTO> createEvent(@Valid @RequestBody CalendarCreateDTO calendarCreateDTO) {
        try {
            CalendarDTO createdEvent = calendarService.createEvent(calendarCreateDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar evento", description = "Actualiza un evento existente. Todos los campos son opcionales.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Evento actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Evento no encontrado")
    })
    public ResponseEntity<CalendarDTO> updateEvent(
            @Parameter(description = "ID del evento") @PathVariable Long id, 
            @Valid @RequestBody CalendarUpdateDTO calendarUpdateDTO) {
        try {
            CalendarDTO updatedEvent = calendarService.updateEvent(id, calendarUpdateDTO);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping
    @Operation(summary = "Obtener todos los eventos", description = "Retorna todos los eventos (activos e inactivos) - Solo administradores")
    public ResponseEntity<List<CalendarDTO>> getAllEvents() {
        List<CalendarDTO> events = calendarService.getAllEvents();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/type/{typeId}")
    @Operation(summary = "Obtener eventos por tipo", description = "Retorna todos los eventos de un tipo específico")
    public ResponseEntity<List<CalendarDTO>> getEventsByType(
            @Parameter(description = "ID del tipo de evento") @PathVariable Long typeId) {
        try {
            List<CalendarDTO> events = calendarService.getEventsByType(typeId);
            return ResponseEntity.ok(events);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/toggle-state")
    @Operation(summary = "Cambiar estado de evento", description = "Activa o desactiva un evento")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estado cambiado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Evento no encontrado")
    })
    public ResponseEntity<Void> toggleEventState(@Parameter(description = "ID del evento") @PathVariable Long id) {
        try {
            calendarService.toggleEventState(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar evento", description = "Marca un evento como inactivo (eliminación lógica)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Evento eliminado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Evento no encontrado")
    })
    public ResponseEntity<Void> deleteEvent(@Parameter(description = "ID del evento") @PathVariable Long id) {
        try {
            calendarService.deleteEvent(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 