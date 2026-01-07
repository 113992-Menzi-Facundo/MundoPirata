package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketDTO {
    
    private Long id;
    private String code;
    private Long locationId;
    private String locationName;
    private BigDecimal price;
    private LocalDateTime dateTime;
    private String eventTitle;
    private Boolean available;
    private LocalDateTime createdAt;
} 