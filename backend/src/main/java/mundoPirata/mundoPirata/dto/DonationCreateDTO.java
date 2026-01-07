package mundoPirata.mundoPirata.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationCreateDTO {
    
    @NotNull(message = "El usuario es obligatorio")
    private Long userId;
    
    @NotNull(message = "El destino es obligatorio")
    private Long destinationId;
    
    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a cero")
    private BigDecimal amount;
    
    private String paymentMethod = "Mercado Pago";
} 