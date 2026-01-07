package mundoPirata.mundoPirata.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mundoPirata.mundoPirata.entity.User;
import mundoPirata.mundoPirata.entity.Ticket;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:noreply@mundopirata.com}")
    private String fromEmail;
    
    private String getHtmlTemplate(String title, String content) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        margin: 0;
                        padding: 0;
                        background: linear-gradient(135deg, #003d82 0%%, #4da6ff 100%%);
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: #ffffff;
                        border-radius: 15px;
                        box-shadow: 0 10px 30px rgba(0, 61, 130, 0.3);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #003d82 0%%, #4da6ff 100%%);
                        color: white;
                        text-align: center;
                        padding: 30px 20px;
                        position: relative;
                    }
                    .header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="r" cx="50%%" cy="0%%" r="50%%"><stop stop-color="%%23fff" stop-opacity=".1"/><stop offset="1" stop-color="%%23fff" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="10" r="8" fill="url(%%23r)"/></svg>') repeat-x;
                        opacity: 0.1;
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%%;
                        background: white;
                        margin: 0 auto 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 5px 15px rgba(255,255,255,0.2);
                        padding: 10px;
                    }
                    .logo img {
                        width: 100%%;
                        height: 100%%;
                        object-fit: contain;
                    }
                    .title {
                        margin: 0;
                        font-size: 28px;
                        font-weight: bold;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    }
                    .subtitle {
                        margin: 5px 0 0;
                        font-size: 16px;
                        opacity: 0.9;
                    }
                    .content {
                        padding: 40px 30px;
                        line-height: 1.6;
                    }
                    .greeting {
                        font-size: 24px;
                        color: #003d82;
                        margin-bottom: 20px;
                        font-weight: bold;
                    }
                    .message {
                        font-size: 16px;
                        margin-bottom: 25px;
                        color: #555;
                    }
                    .highlight-box {
                        background: linear-gradient(135deg, #4da6ff 0%%, #87ceeb 100%%);
                        border-radius: 10px;
                        padding: 20px;
                        margin: 25px 0;
                        color: white;
                        text-align: center;
                        box-shadow: 0 5px 15px rgba(77, 166, 255, 0.3);
                    }
                    .details {
                        background: #f8f9ff;
                        border-left: 4px solid #4da6ff;
                        padding: 20px;
                        margin: 20px 0;
                        border-radius: 0 10px 10px 0;
                    }
                    .steps {
                        background: #f0f8ff;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .step {
                        display: flex;
                        align-items: center;
                        margin: 10px 0;
                        font-size: 16px;
                    }
                    .step-number {
                        background: #003d82;
                        color: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 15px;
                        font-weight: bold;
                    }
                    .cheer {
                        text-align: center;
                        font-size: 24px;
                        font-weight: bold;
                        color: #003d82;
                        margin: 30px 0;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                    }
                    .footer {
                        background: #f8f9ff;
                        padding: 25px;
                        text-align: center;
                        border-top: 3px solid #4da6ff;
                        color: #666;
                        font-size: 14px;
                    }
                    .emoji {
                        font-size: 20px;
                        margin: 0 5px;
                    }
                    .belgrano-colors {
                        background: linear-gradient(90deg, #003d82 50%%, #4da6ff 50%%);
                        height: 5px;
                        margin: 20px 0;
                    }
                    @media (max-width: 600px) {
                        .container { margin: 10px; }
                        .content { padding: 20px; }
                        .title { font-size: 24px; }
                        .greeting { font-size: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">
                            <img src="cid:belgranoLogo" alt="Club Atlético Belgrano" />
                        </div>
                        <h1 class="title">%s</h1>
                        <p class="subtitle">Club Atlético Belgrano</p>
                    </div>
                    <div class="belgrano-colors"></div>
                    <div class="content">
                        %s
                    </div>
                </div>
            </body>
            </html>
            """.formatted(title, title, content);
    }
    
    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            String content = """
                <div class="greeting">¡Hola %s! <span class="emoji">👋</span></div>
                <div class="message">
                    ¡Bienvenido a la familia más grande de Córdoba! Tu cuenta en Mundo Pirata ha sido creada exitosamente.
                </div>
                <div class="highlight-box">
                    <h3 style="margin: 0 0 10px 0;">🎟️ Ya podés disfrutar de:</h3>
                    <p style="margin: 5px 0;">✅ Comprar entradas para todos los partidos</p>
                    <p style="margin: 5px 0;">💙 Realizar donaciones al club</p>
                    <p style="margin: 5px 0;">📰 Estar al día con todas las noticias</p>
                    <p style="margin: 5px 0;">🗺️ Ver ubicaciones de eventos especiales</p>
                </div>
                <div class="cheer">¡VAMOS BELGRANO! 💙⚽</div>
                <div class="footer">
                    <p><strong>Mundo Pirata - Club Atlético Belgrano</strong></p>
                    <p>El orgullo de ser de Belgrano 🏆</p>
                </div>
                """.formatted(userName);
            
            sendHtmlEmail(toEmail, "¡Bienvenido a Mundo Pirata!", content);
            log.info("Email de bienvenida enviado a: {}", toEmail);
        } catch (Exception e) {
            log.error("Error enviando email de bienvenida a {}: {}", toEmail, e.getMessage());
        }
    }
    
    public void sendRoleChangeEmail(String toEmail, String userName, User.Role oldRole, User.Role newRole) {
        try {
            String content = """
                <div class="greeting">¡Hola %s! <span class="emoji">⭐</span></div>
                <div class="message">
                    Tu rol en Mundo Pirata ha sido actualizado. ¡Ahora tenés nuevos permisos y funcionalidades!
                </div>
                <div class="details">
                    <p><strong>Rol anterior:</strong> %s</p>
                    <p><strong>Nuevo rol:</strong> %s</p>
                </div>
                <div class="highlight-box">
                    <h3 style="margin: 0;">🔓 ¡Nuevas funcionalidades desbloqueadas!</h3>
                    <p style="margin: 10px 0 0 0;">Explorá todas las nuevas opciones disponibles en tu cuenta.</p>
                </div>
                <div class="cheer">¡VAMOS BELGRANO! 💙⚽</div>
                <div class="footer">
                    <p><strong>Mundo Pirata - Club Atlético Belgrano</strong></p>
                </div>
                """.formatted(userName, oldRole.toString(), newRole.toString());
            
            sendHtmlEmail(toEmail, "Actualización de Rol - Mundo Pirata", content);
            log.info("Email de cambio de rol enviado a: {}", toEmail);
        } catch (Exception e) {
            log.error("Error enviando email de cambio de rol a {}: {}", toEmail, e.getMessage());
        }
    }
    
    public void sendPurchaseConfirmationEmail(String toEmail, String userName, String orderDetails) {
        try {
            String content = """
                <div class="greeting">¡Hola %s! <span class="emoji">🛒</span></div>
                <div class="message">
                    ¡Tu compra ha sido confirmada exitosamente! Gracias por ser parte del club más grande de Córdoba.
                </div>
                <div class="details">
                    <h3 style="color: #003d82; margin-top: 0;">📋 Detalles de tu compra:</h3>
                    <p>%s</p>
                </div>
                <div class="highlight-box">
                    <h3 style="margin: 0 0 10px 0;">💾 Guardá este email</h3>
                    <p style="margin: 0;">Es tu comprobante oficial de compra</p>
                </div>
                <div class="cheer">¡Nos vemos en el estadio! 🏟️💙</div>
                <div class="footer">
                    <p><strong>Mundo Pirata - Club Atlético Belgrano</strong></p>
                </div>
                """.formatted(userName, orderDetails);
            
            sendHtmlEmail(toEmail, "Confirmación de Compra - Mundo Pirata", content);
            log.info("Email de confirmación de compra enviado a: {}", toEmail);
        } catch (Exception e) {
            log.error("Error enviando email de confirmación de compra a {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendTicketPurchaseConfirmation(String toEmail, String userName) {
        try {
            log.info("🔄 Iniciando envío de email a: {} con usuario: {}", toEmail, userName);
            
            String fechaCompra = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            
            String content = """
                <div class="greeting">¡Hola %s! <span class="emoji">🎟️</span></div>
                <div class="message">
                    ¡Tu compra de entradas ha sido procesada exitosamente! 
                    El sentimiento celeste ya corre por tus venas.
                </div>
                <div class="highlight-box">
                    <h2 style="margin: 0 0 15px 0;">🏆 ¡COMPRA APROBADA! 🏆</h2>
                    <p style="margin: 0; font-size: 18px;">¡Ya tenés tu lugar en el Gigante de Alberdi!</p>
                </div>
                <div class="details">
                    <h3 style="color: #003d82; margin-top: 0;">📋 Detalles de tu compra:</h3>
                    <p><strong>🏟️ Club:</strong> Club Atlético Belgrano</p>
                    <p><strong>📅 Fecha de compra:</strong> %s</p>
                    <p><strong>✅ Estado:</strong> APROBADO</p>
                    <p><strong>🎫 Tipo:</strong> Entrada General</p>
                </div>
                <div class="steps">
                    <h3 style="color: #003d82; margin-top: 0;">📝 Próximos pasos:</h3>
                    <div class="step">
                        <div class="step-number">1</div>
                        <span>Llevá este email como comprobante al estadio</span>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <span>No olvides tu DNI para el ingreso</span>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <span>¡Disfrutá del partido y alentá con todo!</span>
                    </div>
                </div>
                <div class="belgrano-colors"></div>
                <div class="cheer">¡VAMOS BELGRANO CARAJO! 💙⚽🎉</div>
                <div class="footer">
                    <p><strong>🏟️ Mundo Pirata - Club Atlético Belgrano 🏟️</strong></p>
                    <p style="margin: 5px 0;">El orgullo de ser de Belgrano</p>
                    <p style="margin: 5px 0; font-size: 12px; color: #999;">
                        Este es un email automático, no responder.
                    </p>
                </div>
                """.formatted(userName, fechaCompra);
            
            sendHtmlEmail(toEmail, "🎟️ ¡Entradas Confirmadas! - Belgrano", content);
            log.info("✅ Email de confirmación de entradas enviado exitosamente a: {}", toEmail);
            
        } catch (Exception e) {
            log.error("❌ Error enviando email de confirmación de entradas a {}: {}", toEmail, e.getMessage(), e);
        }
    }
    
    public void sendDetailedTicketPurchaseConfirmation(String toEmail, String userName, List<Ticket> purchasedTickets) {
        try {
            log.info("🔄 Iniciando envío de email detallado a: {} con {} tickets", toEmail, purchasedTickets.size());
            
            if (purchasedTickets.isEmpty()) {
                log.warn("No hay tickets para enviar email de confirmación");
                return;
            }
            
            // Obtener información del primer ticket para el evento
            Ticket firstTicket = purchasedTickets.get(0);
            String fechaCompra = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            
            // Información simplificada del evento
            String matchDate = firstTicket.getDateTime()
                .format(java.time.format.DateTimeFormatter.ofPattern("EEEE dd 'de' MMMM 'de' yyyy", 
                    java.util.Locale.forLanguageTag("es-AR")));
            String matchTime = firstTicket.getDateTime()
                .format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
            
            // Generar detalles de los tickets comprados
            StringBuilder ticketDetails = new StringBuilder();
            BigDecimal totalAmount = BigDecimal.ZERO;
            
            // Agrupar por ubicación
            Map<String, List<Ticket>> ticketsByLocation = purchasedTickets.stream()
                .collect(Collectors.groupingBy(ticket -> ticket.getLocation().getName()));
            
            for (Map.Entry<String, List<Ticket>> entry : ticketsByLocation.entrySet()) {
                String locationName = entry.getKey();
                List<Ticket> locationTickets = entry.getValue();
                BigDecimal locationPrice = locationTickets.get(0).getPrice();
                BigDecimal locationTotal = locationPrice.multiply(BigDecimal.valueOf(locationTickets.size()));
                totalAmount = totalAmount.add(locationTotal);
                
                ticketDetails.append(String.format("""
                    <div style="background: #f8f9ff; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #4da6ff;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #003d82; font-size: 16px;">🎫 %s</strong><br>
                                <span style="color: #666; font-size: 14px;">%d entrada%s</span>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: #003d82; font-weight: bold; font-size: 16px;">$%s</div>
                                <div style="color: #666; font-size: 12px;">($%s c/u)</div>
                            </div>
                        </div>
                    </div>
                    """, locationName, locationTickets.size(), 
                    locationTickets.size() > 1 ? "s" : "",
                    formatPrice(locationTotal), formatPrice(locationPrice)));
            }
            
            String content = String.format("""
                <div class="greeting">¡Hola %s! <span class="emoji">🎟️</span></div>
                <div class="message">
                    ¡Tu compra de entradas ha sido procesada exitosamente! 
                    Ya tenés tu lugar asegurado para alentarr al Pirata.
                </div>
                
                <!-- Partido Info Box -->
                <div style="background: linear-gradient(135deg, #003d82 0%%, #4da6ff 100%%); 
                           border-radius: 15px; padding: 25px; margin: 25px 0; color: white; text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                        <div style="width: 80px; height: 80px; background: white; border-radius: 50%%; 
                                   display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                            <img src="cid:belgranoLogo" alt="Belgrano" style="width: 40px; height: 40px; object-fit: contain;" />
                        </div>
                    </div>
                    <h2 style="margin: 0 0 15px 0; font-size: 28px;">Entrada de Belgrano</h2>
                    <div style="font-size: 18px; opacity: 0.9;">
                        📅 %s<br>
                        ⏰ %s hs<br>
                        🏟️ Estadio Julio César Villagra
                    </div>
                </div>
                
                <!-- Tickets Purchased -->
                <div class="details">
                    <h3 style="color: #003d82; margin-top: 0;">🎫 Tus Entradas Confirmadas:</h3>
                    %s
                    <div style="border-top: 2px solid #4da6ff; padding-top: 15px; margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="font-size: 18px; color: #003d82;">TOTAL PAGADO:</strong>
                            <strong style="font-size: 20px; color: #003d82;">$%s</strong>
                        </div>
                    </div>
                </div>
                
                <!-- Purchase Info -->
                <div style="background: #f0f8ff; border-radius: 10px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #003d82; margin-top: 0;">📋 Información de tu Compra:</h3>
                    <p><strong>📅 Fecha de compra:</strong> %s</p>
                    <p><strong>✅ Estado:</strong> <span style="color: #28a745; font-weight: bold;">APROBADO</span></p>
                    <p><strong>📧 Email:</strong> %s</p>
                    <p><strong>🆔 Códigos de entrada:</strong></p>
                    <div style="font-family: monospace; background: #fff; padding: 10px; border-radius: 5px; margin-top: 5px;">
                        %s
                    </div>
                </div>
                
                <div class="steps">
                    <h3 style="color: #003d82; margin-top: 0;">📝 Instrucciones para el día del partido:</h3>
                    <div class="step">
                        <div class="step-number">1</div>
                        <span>Llevá este email como comprobante al estadio</span>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <span>Presentá tu DNI en la entrada correspondiente a tu sector</span>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <span>Llegá con tiempo suficiente (recomendamos 1 hora antes)</span>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <span>¡Disfrutá del partido y alentá con toda la pasión pirata! 💙</span>
                    </div>
                </div>
                
                <div class="belgrano-colors"></div>
                <div class="cheer">¡VAMOS BELGRANO CARAJO! 💙⚽🎉</div>
                
                <div class="footer">
                    <p><strong>🏟️ Mundo Pirata - Club Atlético Belgrano 🏟️</strong></p>
                    <p style="margin: 5px 0;">El orgullo de ser de Belgrano</p>
                    <p style="margin: 5px 0; font-size: 12px; color: #999;">
                        Este es tu comprobante oficial. Conservalo para el día del partido.
                    </p>
                </div>
                """, 
                userName,
                matchDate,
                matchTime,
                ticketDetails.toString(),
                formatPrice(totalAmount),
                fechaCompra,
                toEmail,
                purchasedTickets.stream()
                    .map(ticket -> "• " + ticket.getCode() + " (" + ticket.getLocation().getName() + ")")
                    .collect(Collectors.joining("<br>"))
            );
            
            sendHtmlEmail(toEmail, "🎟️ Entradas Confirmadas - Belgrano", content);
            log.info("✅ Email detallado de confirmación enviado exitosamente a: {}", toEmail);
            
        } catch (Exception e) {
            log.error("❌ Error enviando email detallado a {}: {}", toEmail, e.getMessage(), e);
        }
    }
    
    private String formatPrice(BigDecimal price) {
        return String.format("%,.0f", price);
    }
    
    private void sendHtmlEmail(String toEmail, String subject, String content) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(getHtmlTemplate(subject, content), true);
        
        // Adjuntar logo de Belgrano como imagen incrustada
        try {
            org.springframework.core.io.Resource logoResource = 
                new org.springframework.core.io.ClassPathResource("static/images/belgrano-logo.png");
            helper.addInline("belgranoLogo", logoResource);
        } catch (Exception e) {
            log.warn("No se pudo cargar el logo de Belgrano: {}", e.getMessage());
        }
        
        mailSender.send(message);
    }

    /**
     * Enviar email de confirmación de donación
     */
    public void sendDonationConfirmationEmail(String toEmail, String userName, String destinationName, BigDecimal amount, String paymentId) {
        try {
            String content = String.format("""
                <div class="greeting">
                    ¡Muchas gracias, %s! 💙
                </div>
                
                <div class="message">
                    Tu donación ha sido procesada exitosamente. Gracias a tu generosidad, 
                    Club Atlético Belgrano puede seguir creciendo y brindando alegría a todos sus hinchas.
                </div>
                
                <div class="highlight-box">
                    <h3 style="margin: 0 0 10px; font-size: 20px;">🎯 Donación Confirmada</h3>
                    <p style="margin: 5px 0; font-size: 18px;"><strong>Monto: %s</strong></p>
                    <p style="margin: 5px 0;"><strong>Destino:</strong> %s</p>
                </div>
                
                <div class="details">
                    <h4 style="color: #003d82; margin-bottom: 15px;">
                        📋 Detalles de tu donación
                    </h4>
                    <p><strong>ID de Transacción:</strong> %s</p>
                    <p><strong>Fecha de procesamiento:</strong> %s</p>
                    <p><strong>Método de pago:</strong> MercadoPago</p>
                    <p><strong>Estado:</strong> <span style="color: #28a745; font-weight: bold;">✅ Aprobada</span></p>
                </div>
                
                <div class="steps">
                    <h4 style="color: #003d82; margin-bottom: 15px;">
                        💡 ¿Qué sigue ahora?
                    </h4>
                    <div class="step">
                        <div class="step-number">1</div>
                        <span>Tu donación será destinada directamente a <strong>%s</strong></span>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <span>Recibirás actualizaciones sobre el impacto de tu contribución</span>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <span>Tu nombre será incluido en nuestro registro de benefactores del club</span>
                    </div>
                </div>
                
                <div class="highlight-box" style="background: linear-gradient(135deg, #28a745 0%%, #20c997 100%%);">
                    <h3 style="margin: 0;">🏆 ¡Sos parte de la familia celeste!</h3>
                    <p style="margin: 10px 0 0;">Tu aporte fortalece a Belgrano y nos ayuda a seguir haciendo historia juntos.</p>
                </div>
                
                <div class="cheer">
                    ¡Vamos Belgrano! 💙⚽
                </div>
                
                <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f0f8ff; border-radius: 10px;">
                    <p style="margin: 0; color: #003d82; font-weight: bold;">
                        Conservá este email como comprobante de tu donación
                    </p>
                </div>
                """, 
                userName,
                formatPrice(amount),
                destinationName,
                paymentId,
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                destinationName
            );

            sendHtmlEmail(toEmail, "💙 Donación Confirmada - Club Atlético Belgrano", content);
            
            log.info("Email de confirmación de donación enviado a: {}", toEmail);
            
        } catch (MessagingException e) {
            log.error("Error enviando email de confirmación de donación: {}", e.getMessage());
        }
    }
} 