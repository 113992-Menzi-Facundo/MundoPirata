package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mundoPirata.mundoPirata.entity.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    
    private Long id;
    private Long userId;
    private String userName;
    private BigDecimal totalAmount;
    private LocalDateTime purchaseDate;
    private String paymentMethod;
    private String paymentId;
    private Order.PurchaseState purchaseState;
    private List<OrderItemDTO> orderItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 