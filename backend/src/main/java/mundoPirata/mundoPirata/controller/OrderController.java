package mundoPirata.mundoPirata.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mundoPirata.mundoPirata.dto.OrderDTO;
import mundoPirata.mundoPirata.dto.OrderCreateDTO;
import mundoPirata.mundoPirata.entity.Order;
import mundoPirata.mundoPirata.entity.Ticket;
import mundoPirata.mundoPirata.service.EmailService;
import mundoPirata.mundoPirata.service.OrderService;
import mundoPirata.mundoPirata.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Órdenes", description = "Gestión de órdenes y compras de entradas")
public class OrderController {
    
    private final OrderService orderService;
    
    @Autowired
    private TicketService ticketService;
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping
    @Operation(summary = "Crear nueva orden", description = "Crea una nueva orden de compra de entradas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Orden creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Error en los datos de la orden")
    })
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderCreateDTO orderCreateDTO) {
        try {
            OrderDTO createdOrder = orderService.createOrder(orderCreateDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener orden por ID", description = "Retorna una orden específica por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Orden encontrada"),
        @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    public ResponseEntity<OrderDTO> getOrderById(@Parameter(description = "ID de la orden") @PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(order -> ResponseEntity.ok(order))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    @Operation(summary = "Obtener todas las órdenes", description = "Retorna todas las órdenes del sistema - Solo administradores")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Obtener órdenes por usuario", description = "Retorna todas las órdenes de un usuario específico")
    public ResponseEntity<List<OrderDTO>> getOrdersByUser(@Parameter(description = "ID del usuario") @PathVariable Long userId) {
        try {
            List<OrderDTO> orders = orderService.getOrdersByUser(userId);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/state/{state}")
    @Operation(summary = "Obtener órdenes por estado", description = "Retorna todas las órdenes con un estado específico")
    public ResponseEntity<List<OrderDTO>> getOrdersByState(@Parameter(description = "Estado de la orden") @PathVariable Order.PurchaseState state) {
        List<OrderDTO> orders = orderService.getOrdersByState(state);
        return ResponseEntity.ok(orders);
    }
    
    @PutMapping("/{id}/state")
    @Operation(summary = "Actualizar estado de orden", description = "Actualiza el estado de una orden")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    public ResponseEntity<Void> updateOrderState(
            @Parameter(description = "ID de la orden") @PathVariable Long id,
            @Parameter(description = "Nuevo estado") @RequestParam Order.PurchaseState state) {
        try {
            orderService.updateOrderState(id, state);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/payment-id")
    @Operation(summary = "Actualizar ID de pago", description = "Actualiza el ID de pago de una orden")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "ID de pago actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    public ResponseEntity<Void> updatePaymentId(
            @Parameter(description = "ID de la orden") @PathVariable Long id,
            @Parameter(description = "ID de pago") @RequestParam String paymentId) {
        try {
            orderService.updatePaymentId(id, paymentId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancelar orden", description = "Cancela una orden y libera las entradas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Orden cancelada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    public ResponseEntity<Void> cancelOrder(@Parameter(description = "ID de la orden") @PathVariable Long id) {
        try {
            orderService.cancelOrder(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/stats/total-sales")
    @Operation(summary = "Obtener total de ventas", description = "Retorna el total de ventas aprobadas")
    public ResponseEntity<BigDecimal> getTotalSales() {
        BigDecimal totalSales = orderService.getTotalSales();
        return ResponseEntity.ok(totalSales);
    }

    /**
     * Procesar compra completada - Actualizar disponibilidad y enviar email
     */
    @PostMapping("/process-purchase")
    public ResponseEntity<String> processPurchase(
            @RequestParam String userEmail,
            @RequestParam String ticketIds,
            @RequestParam String paymentStatus) {
        
        try {
            log.info("Procesando compra - Usuario: {}, Tickets: {}, Estado: {}", 
                     userEmail, ticketIds, paymentStatus);

            if ("success".equals(paymentStatus) || "approved".equals(paymentStatus)) {
                // Convertir ticketIds de string a lista
                List<String> ticketIdList = Arrays.asList(ticketIds.split(","));
                List<Ticket> purchasedTickets = new ArrayList<>();
                
                // Actualizar disponibilidad de cada ticket y guardar referencia
                for (String ticketIdStr : ticketIdList) {
                    try {
                        Long ticketId = Long.parseLong(ticketIdStr.trim());
                        
                        // Obtener el ticket antes de marcarlo como vendido
                        List<Ticket> tickets = ticketService.getTicketsByIds(Arrays.asList(ticketId));
                        if (!tickets.isEmpty()) {
                            purchasedTickets.add(tickets.get(0));
                        }
                        
                        // Marcar ticket como vendido
                        ticketService.markTicketAsSold(ticketId);
                        log.info("Ticket {} marcado como vendido", ticketId);
                        
                    } catch (Exception e) {
                        log.error("Error procesando ticket {}: {}", ticketIdStr, e.getMessage());
                    }
                }

                // Enviar email de confirmación DETALLADO con información del partido
                try {
                    if (!purchasedTickets.isEmpty()) {
                        emailService.sendDetailedTicketPurchaseConfirmation(userEmail, "Usuario", purchasedTickets);
                        log.info("Email detallado de confirmación enviado a: {}", userEmail);
                    } else {
                        // Fallback al email simple si no hay tickets
                        emailService.sendTicketPurchaseConfirmation(userEmail, "Usuario");
                        log.warn("No se pudieron obtener detalles de tickets, usando email simple");
                    }
                } catch (Exception e) {
                    log.error("Error enviando email a {}: {}", userEmail, e.getMessage());
                }

                return ResponseEntity.ok("Compra procesada exitosamente");
            } else {
                log.info("Compra no exitosa - Estado: {}", paymentStatus);
                return ResponseEntity.ok("Compra no procesada - Estado: " + paymentStatus);
            }

        } catch (Exception e) {
            log.error("Error procesando compra: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body("Error procesando compra: " + e.getMessage());
        }
    }
} 