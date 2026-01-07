package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mundoPirata.mundoPirata.entity.Donation;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationDTO {
    
    private Long id;
    private Long userId;
    private String userName;
    private Long destinationId;
    private String destinationName;
    private String destinationAddress;
    private BigDecimal amount;
    private LocalDateTime donationDate;
    private String paymentMethod;
    private String paymentId;
    private Donation.PurchaseState purchaseState;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 