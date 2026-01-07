package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    
    private Long id;
    private Long orderId;
    private Long ticketId;
    private String ticketCode;
    private String locationName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
} 