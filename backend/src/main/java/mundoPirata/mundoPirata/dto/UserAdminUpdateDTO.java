package mundoPirata.mundoPirata.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mundoPirata.mundoPirata.entity.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminUpdateDTO {
    
    @NotBlank(message = "El nombre es obligatorio")
    private String name;
    
    @NotBlank(message = "El apellido es obligatorio")
    private String lastName;
    
    @NotNull(message = "El rol es obligatorio")
    private User.Role role;
    
    private Long dni;
    
    // El email NO se incluye porque no se puede modificar por seguridad
    // El password NO se incluye, se requiere endpoint específico para cambiar contraseña
} 