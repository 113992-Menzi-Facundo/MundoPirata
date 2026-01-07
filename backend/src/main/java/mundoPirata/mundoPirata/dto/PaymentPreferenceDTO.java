package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentPreferenceDTO {
    
    private String id;
    private String initPoint;
    private String sandboxInitPoint;
    private String clientId;
    private String publicKey;
    private BigDecimal totalAmount;
    private String currency = "ARS";
    private String description;
    private List<PaymentItemDTO> items;
    private String externalReference;
    private String notificationUrl;
    private String backUrls;
    private String autoReturn = "approved";
    private String expires = "false";
    private String expirationDateFrom;
    private String expirationDateTo;
    private String statementDescriptor = "MUNDO PIRATA";
    private String binaryMode = "false";
} 