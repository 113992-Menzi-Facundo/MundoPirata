package mundoPirata.mundoPirata.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarCreateDTO {
    
    @NotBlank(message = "El título es obligatorio")
    private String title;
    
    private String detail;
    
    @NotNull(message = "El autor es obligatorio")
    private Long authorId;
    
    @NotNull(message = "La fecha es obligatoria")
    private LocalDate date;
    
    @NotNull(message = "El tipo de evento es obligatorio")
    private Long eventTypeId;
} 