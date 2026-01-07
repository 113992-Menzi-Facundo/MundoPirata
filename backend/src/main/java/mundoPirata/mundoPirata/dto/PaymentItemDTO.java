package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentItemDTO {
    
    private String id;
    private String title;
    private String description;
    private String pictureUrl;
    private String categoryId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private String currencyId = "ARS";
} 