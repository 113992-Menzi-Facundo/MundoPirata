package mundoPirata.mundoPirata.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateDTO {
    
    @NotNull(message = "El usuario es obligatorio")
    private Long userId;
    
    @NotEmpty(message = "La orden debe contener al menos un item")
    @Valid
    private List<OrderItemCreateDTO> items;
    
    private String paymentMethod = "Mercado Pago";
} 