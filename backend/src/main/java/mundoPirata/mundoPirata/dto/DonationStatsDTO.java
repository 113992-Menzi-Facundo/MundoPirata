package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationStatsDTO {
    private Long totalDonations;
    private BigDecimal totalAmount;
    private BigDecimal monthlyAmount;
    private BigDecimal avgDonation;
    private List<DestinationStatsDTO> destinationStats;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DestinationStatsDTO {
        private String destination;
        private BigDecimal amount;
        private Long count;
    }
} 