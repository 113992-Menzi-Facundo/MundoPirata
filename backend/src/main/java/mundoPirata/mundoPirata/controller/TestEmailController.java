package mundoPirata.mundoPirata.controller;

import lombok.extern.slf4j.Slf4j;
import mundoPirata.mundoPirata.entity.User;
import mundoPirata.mundoPirata.service.EmailService;
import mundoPirata.mundoPirata.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:4200")
@Slf4j
public class TestEmailController {

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private UserService userService;

    /**
     * Simular webhook exitoso para probar envío de email
     */
    @PostMapping("/simulate-payment-success")
    public ResponseEntity<String> simulatePaymentSuccess(@RequestParam String userEmail) {
        try {
            log.info("Simulando pago exitoso para usuario: {}", userEmail);
            
            Optional<User> userOpt = userService.findByEmail(userEmail);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                // Generar detalles de compra simulada
                String ticketDetails = generateSimulatedTicketDetails();
                
                // Enviar email de confirmación específico para entradas
                emailService.sendTicketPurchaseConfirmation(
                    user.getEmail(),
                    user.getName() + " " + user.getLastName()
                );
                
                log.info("Email de confirmación enviado exitosamente a: {}", user.getEmail());
                return ResponseEntity.ok("Email enviado exitosamente");
            } else {
                log.error("Usuario no encontrado: {}", userEmail);
                return ResponseEntity.badRequest().body("Usuario no encontrado");
            }
            
        } catch (Exception e) {
            log.error("Error simulando pago exitoso: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error enviando email");
        }
    }

    /**
     * Generar detalles simulados de compra de entradas
     */
    private String generateSimulatedTicketDetails() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String paymentId = "MP_TEST_" + System.currentTimeMillis();
        
        return String.format("""
            🎫 COMPRA DE ENTRADAS - CLUB ATLÉTICO BELGRANO
            
            ✅ PAGO CONFIRMADO
            
            📋 DETALLES DE LA COMPRA:
            • ID de Pago: %s
            • Fecha de compra: %s
            • Método de pago: MercadoPago
            
            🏟️ DETALLES DEL EVENTO:
            • Evento: Belgrano vs River Plate
            • Fecha del partido: 28/06/2025 15:30hs
            • Estadio: Julio César Villagra
            • Ubicación: Popular Pirata
            • Cantidad: 1 entrada
            • Precio: $8,000.00
            
            📧 IMPORTANTE:
            • Conserva este email como comprobante
            • Presenta tu DNI al ingresar al estadio
            • Las puertas abren 2 horas antes del partido
            
            ¡NOS VEMOS EN EL GIGANTE DE ALBERDI!
            ¡VAMOS BELGRANO! 💙🤍
            """, paymentId, LocalDateTime.now().format(formatter));
    }
} 