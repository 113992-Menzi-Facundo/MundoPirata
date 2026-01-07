package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarDTO {
    
    private Long id;
    private String title;
    private String detail;
    private Long authorId;
    private String authorName;
    private LocalDate date;
    private Long eventTypeId;
    private String eventTypeDescription;
    private Boolean state;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 