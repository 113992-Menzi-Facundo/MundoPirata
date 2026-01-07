package mundoPirata.mundoPirata.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import lombok.extern.slf4j.Slf4j;
import mundoPirata.mundoPirata.entity.Donation;
import mundoPirata.mundoPirata.entity.Ticket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class CheckOutProService {

    @Autowired
    private mundoPirata.mundoPirata.config.MercadoPagoConfig mercadoPagoConfig;

    /**
     * Crear preferencia de pago para donaciones
     */
    public String createDonationPreference(Donation donation) {
        try {
            // Configurar AccessToken de MercadoPago
            MercadoPagoConfig.setAccessToken(mercadoPagoConfig.getAccessToken());
            
            log.info("Creando preferencia para donación ID: {} - Monto: {}", 
                     donation.getId(), donation.getAmount());
            
            PreferenceClient client = new PreferenceClient();

            // Item simplificado SIN pictureUrl ni categoryId problemáticos
            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .id("donation_" + donation.getId())
                    .title("Donacion Club Belgrano")
                    .description("Donacion al Club Atletico Belgrano")
                    .quantity(1)
                    .currencyId("ARS")
                    .unitPrice(donation.getAmount())
                    .build();

            List<PreferenceItemRequest> items = new ArrayList<>();
            items.add(itemRequest);

            // URLs de retorno con formato correcto
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("http://localhost:4200/donaciones?payment=success&donation=" + donation.getId())
                    .failure("http://localhost:4200/donaciones?payment=failure&donation=" + donation.getId())
                    .pending("http://localhost:4200/donaciones?payment=pending&donation=" + donation.getId())
                    .build();

            // Preferencia SIN autoReturn problemático
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .backUrls(backUrls)
                    .externalReference("donation_" + donation.getId())
                    .build();

            log.info("Enviando request simplificado a MercadoPago...");

            Preference preference = client.create(preferenceRequest);
            
            log.info("¡ÉXITO! Preferencia de donación creada: {}", preference.getId());
            return preference.getId();

        } catch (MPApiException e) {
            log.error("Error API de MercadoPago - Status: {} - Message: {}", 
                      e.getStatusCode(), e.getMessage());
            
            // Intentar obtener detalles de la respuesta
            if (e.getApiResponse() != null) {
                try {
                    log.error("Response Content: {}", e.getApiResponse().getContent());
                } catch (Exception ex) {
                    log.error("Error obteniendo detalles: {}", ex.getMessage());
                }
            }
            return null;
        } catch (MPException e) {
            log.error("Error SDK de MercadoPago: {}", e.getMessage(), e);
            return null;
        } catch (Exception e) {
            log.error("Error general: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Crear preferencia de pago para entradas
     */
    public String createTicketPreference(List<Ticket> tickets, String userEmail) {
        try {
            // Configurar AccessToken de MercadoPago
            MercadoPagoConfig.setAccessToken(mercadoPagoConfig.getAccessToken());
            
            log.info("Creando preferencia para {} entradas para usuario: {}", 
                     tickets.size(), userEmail);
            
            PreferenceClient client = new PreferenceClient();
            List<PreferenceItemRequest> items = new ArrayList<>();
            BigDecimal totalAmount = BigDecimal.ZERO;

            // Crear items para cada entrada (SIMPLIFICADO)
            for (int i = 0; i < tickets.size(); i++) {
                Ticket ticket = tickets.get(i);
                
                PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                        .id("ticket_" + ticket.getId())
                        .title("Entrada Club Belgrano")
                        .description("Entrada para partido del Club Atletico Belgrano")
                        .quantity(1)
                        .currencyId("ARS")
                        .unitPrice(ticket.getPrice())
                        .build();

                items.add(itemRequest);
                totalAmount = totalAmount.add(ticket.getPrice());
            }

            // URLs de retorno con información del usuario y tickets
            String ticketIds = tickets.stream()
                    .map(t -> String.valueOf(t.getId()))
                    .reduce((a, b) -> a + "," + b)
                    .orElse("");
            
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("http://localhost:4200/entradas?payment=success&userEmail=" + userEmail + "&ticketIds=" + ticketIds)
                    .failure("http://localhost:4200/entradas?payment=failure&userEmail=" + userEmail + "&ticketIds=" + ticketIds)
                    .pending("http://localhost:4200/entradas?payment=pending&userEmail=" + userEmail + "&ticketIds=" + ticketIds)
                    .build();

            // Preferencia sin auto-return (MercadoPago maneja el retorno con las URLs)
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .backUrls(backUrls)
                    .externalReference("tickets_" + userEmail + "_" + System.currentTimeMillis())
                    .build();

            log.info("Enviando request simplificado para entradas a MercadoPago...");

            Preference preference = client.create(preferenceRequest);
            
            log.info("¡ÉXITO! Preferencia de entradas creada: {} por ${}", preference.getId(), totalAmount);
            return preference.getId();

        } catch (MPApiException e) {
            log.error("Error API de MercadoPago - Status: {} - Message: {}", 
                      e.getStatusCode(), e.getMessage());
            
            // Intentar obtener detalles de la respuesta
            if (e.getApiResponse() != null) {
                try {
                    log.error("Response Content: {}", e.getApiResponse().getContent());
                } catch (Exception ex) {
                    log.error("Error obteniendo detalles: {}", ex.getMessage());
                }
            }
            return null;
        } catch (MPException e) {
            log.error("Error SDK de MercadoPago: {}", e.getMessage(), e);
            return null;
        } catch (Exception e) {
            log.error("Error general: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Obtener información de una preferencia
     */
    public Preference getPreference(String preferenceId) {
        try {
            // Configurar AccessToken de MercadoPago
            MercadoPagoConfig.setAccessToken(mercadoPagoConfig.getAccessToken());
            
            PreferenceClient client = new PreferenceClient();
            return client.get(preferenceId);
        } catch (MPException | MPApiException e) {
            log.error("Error obteniendo preferencia {}: {}", preferenceId, e.getMessage());
            return null;
        }
    }
} 