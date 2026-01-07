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
public class NewsCreateDTO {
    
    @NotNull(message = "El tipo de noticia es obligatorio")
    private Long typeId;
    
    @NotBlank(message = "El título es obligatorio")
    private String title;
    
    @NotBlank(message = "El contenido es obligatorio")
    private String content;
    
    @NotNull(message = "El autor es obligatorio")
    private Long authorId;
    
    private LocalDate date; // Si no se envía, se usa la fecha actual
} 