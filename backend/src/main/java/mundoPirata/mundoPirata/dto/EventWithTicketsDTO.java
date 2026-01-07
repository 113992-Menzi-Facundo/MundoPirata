package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventWithTicketsDTO {
    
    private Long eventId;
    private String eventTitle;
    private String eventDetail;
    private LocalDateTime eventDate;
    private String eventType;
    private List<TicketsByLocationDTO> tickets;
} 