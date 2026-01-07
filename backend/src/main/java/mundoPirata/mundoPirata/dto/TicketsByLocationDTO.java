package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketsByLocationDTO {
    
    private LocationDTO location;
    private List<TicketDTO> availableTickets;
    private int availableCount;
    private int soldCount;
} 