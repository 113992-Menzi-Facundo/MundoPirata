package mundoPirata.mundoPirata.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {
    
    @NotBlank(message = "El nombre es obligatorio")
    private String name;
    
    @NotBlank(message = "El apellido es obligatorio")
    private String lastName;
    
    private Long dni;
    
    // No incluimos email (no se puede cambiar por seguridad)
    // No incluimos password (se requiere endpoint específico)
    // No incluimos role (se requiere endpoint específico)
    // No incluimos ID (autogenerado)
} 