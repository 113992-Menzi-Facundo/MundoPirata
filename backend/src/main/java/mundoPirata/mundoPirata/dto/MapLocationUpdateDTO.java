package mundoPirata.mundoPirata.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapLocationUpdateDTO {
    
    private String name;
    private String address;
    private String description;
    
    @Pattern(regexp = ".*maps\\.google\\.|.*goo\\.gl/maps|.*maps\\.app\\.goo\\.gl.*", 
             message = "Debe ser un enlace válido de Google Maps")
    private String googleMapsUrl;
    
    // No incluimos authorId por seguridad - solo el creador o admin puede modificar
} 