package mundoPirata.mundoPirata.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketCreateDTO {
    
    @NotNull(message = "La ubicación es obligatoria")
    private Long locationId;
    
    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a cero")
    private BigDecimal price;
    
    @NotNull(message = "La fecha y hora del evento es obligatoria")
    private LocalDateTime dateTime;
    
    private String code; // Si no se envía, se genera automáticamente
} 