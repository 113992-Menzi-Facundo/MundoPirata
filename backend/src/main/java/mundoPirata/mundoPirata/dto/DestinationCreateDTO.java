package mundoPirata.mundoPirata.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DestinationCreateDTO {
    @NotBlank(message = "El nombre es obligatorio")
    private String name;
    
    private String address;
    
    private String phoneNumber;
} 