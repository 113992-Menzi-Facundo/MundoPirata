package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapLocationDTO {
    
    private Long id;
    private String name;
    private String address;
    private String description;
    private String googleMapsUrl;
    private Long authorId;
    private String authorName;
    private Boolean state;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 