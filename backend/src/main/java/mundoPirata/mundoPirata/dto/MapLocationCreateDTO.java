package mundoPirata.mundoPirata.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapLocationCreateDTO {
    
    @NotBlank(message = "El nombre del lugar es obligatorio")
    private String name;
    
    @NotBlank(message = "La dirección es obligatoria")
    private String address;
    
    private String description;
    
    @NotBlank(message = "El enlace de Google Maps es obligatorio")
    @Pattern(regexp = ".*maps\\.google\\.|.*goo\\.gl/maps|.*maps\\.app\\.goo\\.gl.*", 
             message = "Debe ser un enlace válido de Google Maps")
    private String googleMapsUrl;
    
    @NotNull(message = "El autor es obligatorio")
    private Long authorId;
} 