package mundoPirata.mundoPirata.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.TicketDTO;
import mundoPirata.mundoPirata.dto.TicketCreateDTO;
import mundoPirata.mundoPirata.dto.EventWithTicketsDTO;
import mundoPirata.mundoPirata.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Entradas", description = "Gestión de entradas y tickets del club")
public class TicketController {
    
    private final TicketService ticketService;
    
    // Endpoints públicos
    @GetMapping("/public")
    @Operation(summary = "Obtener entradas disponibles", description = "Retorna todas las entradas disponibles")
    @ApiResponse(responseCode = "200", description = "Lista de entradas disponibles")
    public ResponseEntity<List<TicketDTO>> getAvailableTickets() {
        List<TicketDTO> tickets = ticketService.getAllAvailableTickets();
        return ResponseEntity.ok(tickets);
    }
    
    @GetMapping("/public/{id}")
    @Operation(summary = "Obtener entrada por ID", description = "Retorna una entrada específica por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Entrada encontrada"),
        @ApiResponse(responseCode = "404", description = "Entrada no encontrada")
    })
    public ResponseEntity<TicketDTO> getTicketById(@Parameter(description = "ID de la entrada") @PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(ticket -> ResponseEntity.ok(ticket))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/public/code/{code}")
    @Operation(summary = "Obtener entrada por código", description = "Retorna una entrada específica por su código")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Entrada encontrada"),
        @ApiResponse(responseCode = "404", description = "Entrada no encontrada")
    })
    public ResponseEntity<TicketDTO> getTicketByCode(@Parameter(description = "Código de la entrada") @PathVariable String code) {
        return ticketService.getTicketByCode(code)
                .map(ticket -> ResponseEntity.ok(ticket))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/public/location/{locationId}")
    @Operation(summary = "Obtener entradas disponibles por ubicación", description = "Retorna entradas disponibles de una ubicación específica")
    @ApiResponse(responseCode = "200", description = "Lista de entradas de la ubicación")
    public ResponseEntity<List<TicketDTO>> getAvailableTicketsByLocation(@Parameter(description = "ID de la ubicación") @PathVariable Long locationId) {
        try {
            List<TicketDTO> tickets = ticketService.getAvailableTicketsByLocation(locationId);
            return ResponseEntity.ok(tickets);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/public/events-with-tickets")
    @Operation(summary = "Obtener eventos con entradas disponibles", description = "Retorna todos los eventos con sus entradas agrupadas por ubicación")
    @ApiResponse(responseCode = "200", description = "Lista de eventos con entradas")
    public ResponseEntity<List<EventWithTicketsDTO>> getEventsWithTickets() {
        List<EventWithTicketsDTO> events = ticketService.getEventsWithTickets();
        return ResponseEntity.ok(events);
    }
    
    // Endpoints administrativos
    @PostMapping
    @Operation(summary = "Crear nueva entrada", description = "Crea una nueva entrada en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Entrada creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Error en los datos de la entrada")
    })
    public ResponseEntity<TicketDTO> createTicket(@Valid @RequestBody TicketCreateDTO ticketCreateDTO) {
        try {
            TicketDTO createdTicket = ticketService.createTicket(ticketCreateDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    @Operation(summary = "Obtener todas las entradas", description = "Retorna todas las entradas (disponibles y vendidas) - Solo administradores")
    public ResponseEntity<List<TicketDTO>> getAllTickets() {
        List<TicketDTO> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }
    
    @GetMapping("/location/{locationId}")
    @Operation(summary = "Obtener entradas por ubicación", description = "Retorna todas las entradas de una ubicación específica")
    public ResponseEntity<List<TicketDTO>> getTicketsByLocation(@Parameter(description = "ID de la ubicación") @PathVariable Long locationId) {
        try {
            List<TicketDTO> tickets = ticketService.getTicketsByLocation(locationId);
            return ResponseEntity.ok(tickets);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/stats/available/{locationId}")
    @Operation(summary = "Obtener cantidad de entradas disponibles por ubicación", description = "Retorna el número de entradas disponibles de una ubicación")
    public ResponseEntity<Long> getAvailableTicketsCountByLocation(@Parameter(description = "ID de la ubicación") @PathVariable Long locationId) {
        try {
            Long count = ticketService.getAvailableTicketsCountByLocation(locationId);
            return ResponseEntity.ok(count);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/stats/sold")
    @Operation(summary = "Obtener cantidad de entradas vendidas", description = "Retorna el número total de entradas vendidas")
    public ResponseEntity<Long> getSoldTicketsCount() {
        Long count = ticketService.getSoldTicketsCount();
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/{id}/mark-sold")
    @Operation(summary = "Marcar entrada como vendida", description = "Marca una entrada como vendida (no disponible)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Entrada marcada como vendida"),
        @ApiResponse(responseCode = "404", description = "Entrada no encontrada")
    })
    public ResponseEntity<Void> markTicketAsSold(@Parameter(description = "ID de la entrada") @PathVariable Long id) {
        try {
            ticketService.markTicketAsSold(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/mark-available")
    @Operation(summary = "Marcar entrada como disponible", description = "Marca una entrada como disponible")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Entrada marcada como disponible"),
        @ApiResponse(responseCode = "404", description = "Entrada no encontrada")
    })
    public ResponseEntity<Void> markTicketAsAvailable(@Parameter(description = "ID de la entrada") @PathVariable Long id) {
        try {
            ticketService.markTicketAsAvailable(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar entrada", description = "Elimina una entrada del sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Entrada eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Entrada no encontrada")
    })
    public ResponseEntity<Void> deleteTicket(@Parameter(description = "ID de la entrada") @PathVariable Long id) {
        try {
            ticketService.deleteTicket(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 