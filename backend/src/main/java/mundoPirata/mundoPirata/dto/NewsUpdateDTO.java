package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsUpdateDTO {
    
    private Long typeId;
    private String title;
    private String content;
    private LocalDate date;
    
    // No incluimos authorId en update por seguridad
    // No incluimos typeDescription ni authorName porque se calculan automáticamente
} 