package mundoPirata.mundoPirata.controller;

import lombok.extern.slf4j.Slf4j;
import mundoPirata.mundoPirata.entity.Donation;
import mundoPirata.mundoPirata.entity.Ticket;
import mundoPirata.mundoPirata.entity.User;
import mundoPirata.mundoPirata.service.CheckOutProService;
import mundoPirata.mundoPirata.service.DonationService;
import mundoPirata.mundoPirata.service.TicketService;
import mundoPirata.mundoPirata.service.EmailService;
import mundoPirata.mundoPirata.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/checkout-pro")
@CrossOrigin(origins = "http://localhost:4200")
@Slf4j
public class CheckOutProController {

    @Autowired
    private CheckOutProService checkOutProService;
    
    @Autowired
    private DonationService donationService;
    
    @Autowired
    private TicketService ticketService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private UserService userService;

    /**
     * Crear preferencia de pago para una donación
     */
    @PostMapping("/donations/{donationId}/preference")
    public ResponseEntity<Map<String, String>> createDonationPreference(@PathVariable Long donationId) {
        try {
            log.info("Creando preferencia CheckOut Pro para donación ID: {}", donationId);
            
            Optional<Donation> donationOpt = donationService.getDonationEntityById(donationId);
            if (donationOpt.isEmpty()) {
                log.error("Donación no encontrada: {}", donationId);
                return ResponseEntity.notFound().build();
            }
            
            Donation donation = donationOpt.get();

            String preferenceId = checkOutProService.createDonationPreference(donation);
            
            if (preferenceId != null) {
                Map<String, String> response = new HashMap<>();
                response.put("preferenceId", preferenceId);
                response.put("checkoutUrl", "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=" + preferenceId);
                
                log.info("Preferencia creada exitosamente: {}", preferenceId);
                return ResponseEntity.ok(response);
            } else {
                log.error("Error creando preferencia para donación {}", donationId);
                return ResponseEntity.internalServerError().build();
            }
            
        } catch (Exception e) {
            log.error("Error creando preferencia de donación: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Crear preferencia de pago para entradas
     */
    @PostMapping("/tickets/preference")
    public ResponseEntity<Map<String, String>> createTicketPreference(
            @RequestBody List<Long> ticketIds,
            @RequestParam String userEmail) {
        try {
            log.info("Creando preferencia CheckOut Pro para entradas: {} tickets para {}", ticketIds.size(), userEmail);
            
            List<Ticket> tickets = ticketService.getTicketsByIds(ticketIds);
            if (tickets.isEmpty()) {
                log.error("No se encontraron entradas para los IDs: {}", ticketIds);
                return ResponseEntity.notFound().build();
            }

            String preferenceId = checkOutProService.createTicketPreference(tickets, userEmail);
            
            if (preferenceId != null) {
                Map<String, String> response = new HashMap<>();
                response.put("preferenceId", preferenceId);
                response.put("checkoutUrl", "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=" + preferenceId);
                
                log.info("Preferencia de entradas creada exitosamente: {}", preferenceId);
                return ResponseEntity.ok(response);
            } else {
                log.error("Error creando preferencia para entradas");
                return ResponseEntity.internalServerError().build();
            }
            
        } catch (Exception e) {
            log.error("Error creando preferencia de entradas: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Webhook para notificaciones de MercadoPago
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) {
        try {
            log.info("Webhook recibido: {}", payload);
            
            String type = (String) payload.get("type");
            String action = (String) payload.get("action");
            
            if ("payment".equals(type) && "payment.updated".equals(action)) {
                Map<String, Object> data = (Map<String, Object>) payload.get("data");
                String paymentId = (String) data.get("id");
                
                log.info("Procesando pago ID: {} - Acción: {}", paymentId, action);
                
                // Simular verificación del estado del pago
                // En una implementación real, consultarías la API de MercadoPago
                String paymentStatus = "approved"; // Simulamos que el pago fue aprobado
                
                if ("approved".equals(paymentStatus)) {
                    // Extraer referencia externa para identificar el tipo de pago
                    String externalReference = extractExternalReference(payload);
                    
                    if (externalReference != null) {
                        if (externalReference.startsWith("tickets_")) {
                            handleApprovedTicketPayment(paymentId, externalReference);
                        } else if (externalReference.startsWith("donation_")) {
                            handleApprovedDonationPayment(paymentId, externalReference);
                        }
                    }
                }
                
                return ResponseEntity.ok("OK");
            }
            
            return ResponseEntity.ok("OK");
            
        } catch (Exception e) {
            log.error("Error procesando webhook: {}", e.getMessage(), e);
            return ResponseEntity.ok("OK"); // Siempre devolver OK para evitar reenvíos
        }
    }
    
    /**
     * Manejar pago aprobado de entradas
     */
    private void handleApprovedTicketPayment(String paymentId, String externalReference) {
        try {
            // Extraer email del usuario de la referencia externa
            String[] parts = externalReference.split("_");
            if (parts.length >= 2) {
                String userEmail = parts[1];
                
                Optional<User> userOpt = userService.findByEmail(userEmail);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    
                    // Generar detalles de la compra
                    String ticketDetails = generateTicketPurchaseDetails(paymentId, externalReference);
                    
                    // Enviar email de confirmación
                    emailService.sendPurchaseConfirmationEmail(
                        user.getEmail(),
                        user.getName(),
                        ticketDetails
                    );
                    
                    log.info("Email de confirmación de entradas enviado a: {}", user.getEmail());
                }
            }
        } catch (Exception e) {
            log.error("Error enviando email de confirmación de entradas: {}", e.getMessage());
        }
    }
    
    /**
     * Manejar pago aprobado de donación
     */
    private void handleApprovedDonationPayment(String paymentId, String externalReference) {
        try {
            // Extraer ID de donación
            String donationIdStr = externalReference.replace("donation_", "");
            Long donationId = Long.parseLong(donationIdStr);
            
            Optional<Donation> donationOpt = donationService.getDonationEntityById(donationId);
            if (donationOpt.isPresent()) {
                Donation donation = donationOpt.get();
                User user = donation.getUser();
                
                // Actualizar estado de la donación a aprobada
                donationService.updateDonationState(donationId, Donation.PurchaseState.approved);
                donationService.updatePaymentId(donationId, paymentId);
                
                // Enviar email de confirmación específico para donaciones
                emailService.sendDonationConfirmationEmail(
                    user.getEmail(),
                    user.getName(),
                    donation.getDestination().getName(),
                    donation.getAmount(),
                    paymentId
                );
                
                log.info("Email de confirmación de donación enviado a: {} para donación ID: {}", user.getEmail(), donationId);
            }
        } catch (Exception e) {
            log.error("Error enviando email de confirmación de donación: {}", e.getMessage());
        }
    }
    
    /**
     * Extraer referencia externa del payload
     */
    private String extractExternalReference(Map<String, Object> payload) {
        try {
            // En un webhook real, la referencia externa estaría en el payload
            // Para esta simulación, usamos un ejemplo
            return "tickets_facumenzi@gmail.com_" + System.currentTimeMillis();
        } catch (Exception e) {
            log.error("Error extrayendo referencia externa: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Generar detalles de compra de entradas
     */
    private String generateTicketPurchaseDetails(String paymentId, String externalReference) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        return String.format("""
            Compra de Entradas - Club Atlético Belgrano
            
            ID de Pago: %s
            Referencia: %s
            Fecha: %s
            
            Detalles de las entradas:
            • Evento: Partido de Belgrano
            • Fecha del partido: Por confirmar
            • Ubicación: Popular Pirata
            • Cantidad: 1 entrada
            • Total pagado: $8,000.00
            
            ¡Nos vemos en el estadio!
            """, paymentId, externalReference, java.time.LocalDateTime.now().format(formatter));
    }
    
    /**
     * Generar detalles de donación
     */
    private String generateDonationDetails(Donation donation, String paymentId) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        return String.format("""
            Donación - Club Atlético Belgrano
            
            ID de Pago: %s
            Fecha: %s
            
            Detalles de la donación:
            • Destino: %s
            • Monto: $%,.2f
            • Método de pago: MercadoPago
            
            ¡Gracias por tu aporte al club!
            """, paymentId, donation.getDonationDate().format(formatter), 
            donation.getDestination().getName(), donation.getAmount());
    }
} 