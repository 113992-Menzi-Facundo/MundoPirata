package mundoPirata.mundoPirata.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mundoPirata.mundoPirata.dto.DonationDTO;
import mundoPirata.mundoPirata.dto.DonationCreateDTO;
import mundoPirata.mundoPirata.entity.Donation;
import mundoPirata.mundoPirata.service.DonationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Donaciones", description = "Gestión de donaciones del club")
@Slf4j
public class DonationController {
    
    private final DonationService donationService;
    
    // Endpoints públicos
    @GetMapping("/public/{id}")
    @Operation(summary = "Obtener donación por ID (público)", description = "Retorna una donación específica por su ID - Acceso público")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Donación encontrada"),
        @ApiResponse(responseCode = "404", description = "Donación no encontrada")
    })
    public ResponseEntity<DonationDTO> getPublicDonationById(@Parameter(description = "ID de la donación") @PathVariable Long id) {
        return donationService.getDonationById(id)
                .map(donation -> ResponseEntity.ok(donation))
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Endpoints administrativos
    @PostMapping
    @Operation(summary = "Crear nueva donación", description = "Crea una nueva donación en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Donación creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Error en los datos de la donación")
    })
    public ResponseEntity<DonationDTO> createDonation(@Valid @RequestBody DonationCreateDTO donationCreateDTO) {
        try {
            DonationDTO createdDonation = donationService.createDonation(donationCreateDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDonation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener donación por ID", description = "Retorna una donación específica por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Donación encontrada"),
        @ApiResponse(responseCode = "404", description = "Donación no encontrada")
    })
    public ResponseEntity<DonationDTO> getDonationById(@Parameter(description = "ID de la donación") @PathVariable Long id) {
        return donationService.getDonationById(id)
                .map(donation -> ResponseEntity.ok(donation))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    @Operation(summary = "Obtener todas las donaciones", description = "Retorna todas las donaciones del sistema - Solo administradores")
    public ResponseEntity<List<DonationDTO>> getAllDonations() {
        List<DonationDTO> donations = donationService.getAllDonations();
        return ResponseEntity.ok(donations);
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Obtener donaciones por usuario", description = "Retorna todas las donaciones de un usuario específico")
    public ResponseEntity<List<DonationDTO>> getDonationsByUser(@Parameter(description = "ID del usuario") @PathVariable Long userId) {
        try {
            List<DonationDTO> donations = donationService.getDonationsByUser(userId);
            return ResponseEntity.ok(donations);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/destination/{destinationId}")
    @Operation(summary = "Obtener donaciones por destino", description = "Retorna todas las donaciones para un destino específico")
    public ResponseEntity<List<DonationDTO>> getDonationsByDestination(@Parameter(description = "ID del destino") @PathVariable Long destinationId) {
        try {
            List<DonationDTO> donations = donationService.getDonationsByDestination(destinationId);
            return ResponseEntity.ok(donations);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/state/{state}")
    @Operation(summary = "Obtener donaciones por estado", description = "Retorna todas las donaciones con un estado específico")
    public ResponseEntity<List<DonationDTO>> getDonationsByState(@Parameter(description = "Estado de la donación") @PathVariable Donation.PurchaseState state) {
        List<DonationDTO> donations = donationService.getDonationsByState(state);
        return ResponseEntity.ok(donations);
    }
    
    @PutMapping("/{id}/state")
    @Operation(summary = "Actualizar estado de donación", description = "Actualiza el estado de una donación")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Donación no encontrada")
    })
    public ResponseEntity<Void> updateDonationState(
            @Parameter(description = "ID de la donación") @PathVariable Long id,
            @Parameter(description = "Nuevo estado") @RequestParam Donation.PurchaseState state) {
        try {
            donationService.updateDonationState(id, state);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/payment-id")
    @Operation(summary = "Actualizar ID de pago", description = "Actualiza el ID de pago de una donación")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "ID de pago actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Donación no encontrada")
    })
    public ResponseEntity<Void> updatePaymentId(
            @Parameter(description = "ID de la donación") @PathVariable Long id,
            @Parameter(description = "ID de pago") @RequestParam String paymentId) {
        try {
            donationService.updatePaymentId(id, paymentId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancelar donación", description = "Cancela una donación")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Donación cancelada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Donación no encontrada")
    })
    public ResponseEntity<Void> cancelDonation(@Parameter(description = "ID de la donación") @PathVariable Long id) {
        try {
            donationService.cancelDonation(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/stats/total")
    @Operation(summary = "Obtener total de donaciones", description = "Retorna el total de donaciones aprobadas")
    public ResponseEntity<BigDecimal> getTotalDonations() {
        BigDecimal totalDonations = donationService.getTotalDonations();
        return ResponseEntity.ok(totalDonations);
    }

    /**
     * Procesar donación después del pago exitoso (Similar al process-purchase de entradas)
     */
    @PostMapping("/process-donation")
    @Operation(summary = "Procesar donación exitosa", description = "Procesa una donación después del pago exitoso en MercadoPago")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Donación procesada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Error en los parámetros"),
        @ApiResponse(responseCode = "404", description = "Donación no encontrada")
    })
    public ResponseEntity<String> processDonation(
            @Parameter(description = "ID de la donación") @RequestParam Long donationId,
            @Parameter(description = "Estado del pago") @RequestParam String paymentStatus,
            @Parameter(description = "ID del pago de MercadoPago") @RequestParam(required = false) String paymentId) {
        
        try {
            log.info("Procesando donación - ID: {}, Estado: {}, PaymentID: {}", 
                     donationId, paymentStatus, paymentId);

            if ("success".equals(paymentStatus) || "approved".equals(paymentStatus)) {
                // Actualizar estado de la donación a aprobada
                donationService.updateDonationState(donationId, Donation.PurchaseState.approved);
                
                // Actualizar ID de pago si está disponible
                if (paymentId != null && !paymentId.isEmpty()) {
                    donationService.updatePaymentId(donationId, paymentId);
                } else {
                    // Generar un ID de pago temporal si no existe
                    String tempPaymentId = "MP_DONATION_" + donationId + "_" + System.currentTimeMillis();
                    donationService.updatePaymentId(donationId, tempPaymentId);
                }

                log.info("Donación {} procesada exitosamente", donationId);
                return ResponseEntity.ok("Donación procesada exitosamente");
            } else {
                log.info("Donación {} no exitosa - Estado: {}", donationId, paymentStatus);
                return ResponseEntity.ok("Donación no procesada - Estado: " + paymentStatus);
            }

        } catch (RuntimeException e) {
            log.error("Error procesando donación {}: {}", donationId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body("Error procesando donación: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error general procesando donación {}: {}", donationId, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body("Error interno procesando donación: " + e.getMessage());
        }
    }
} 