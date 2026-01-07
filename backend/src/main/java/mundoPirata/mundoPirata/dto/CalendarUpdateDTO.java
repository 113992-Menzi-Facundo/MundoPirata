package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarUpdateDTO {
    
    private String title;
    private String detail;
    private LocalDate date;
    private Long eventTypeId;
    
    // No incluimos authorId por seguridad
    // No incluimos eventTypeDescription porque se calcula automáticamente
} 