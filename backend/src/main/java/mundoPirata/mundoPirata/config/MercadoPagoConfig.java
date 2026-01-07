package mundoPirata.mundoPirata.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
@Slf4j
public class MercadoPagoConfig {
    
    @Value("${mercadopago.access.token:}")
    private String accessToken;
    
    @Value("${mercadopago.public.key:}")
    private String publicKey;
    
    @Value("${mercadopago.client.id:}")
    private String clientId;
    
    @Value("${mercadopago.client.secret:}")
    private String clientSecret;
    
    @PostConstruct
    public void initializeMercadoPago() {
        if (accessToken != null && !accessToken.isEmpty()) {
            log.info("MercadoPago SDK inicializado correctamente");
            log.info("Client ID: {}", clientId);
            log.info("Public Key: {}***", publicKey != null ? publicKey.substring(0, Math.min(publicKey.length(), 10)) : "null");
            log.info("Client Secret configurado: {}", clientSecret != null && !clientSecret.isEmpty() ? "SI" : "NO");
        } else {
            log.warn("MercadoPago no configurado - usando modo simulado");
        }
    }
    
    public String getAccessToken() {
        return accessToken;
    }
    
    public String getPublicKey() {
        return publicKey;
    }
    
    public String getClientId() {
        return clientId;
    }
    
    public String getClientSecret() {
        return clientSecret;
    }
} 