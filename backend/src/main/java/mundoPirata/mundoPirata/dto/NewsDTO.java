package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsDTO {
    
    private Long id;
    private Long typeId;
    private String typeDescription;
    private String title;
    private String content;
    private Long authorId;
    private String authorName;
    private LocalDate date;
    private Boolean state;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 