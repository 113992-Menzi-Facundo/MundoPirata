package mundoPirata.mundoPirata.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "map_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapLocation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre del lugar es obligatorio")
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    @NotBlank(message = "La dirección es obligatoria")
    @Column(name = "address", nullable = false, length = 500)
    private String address;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @NotBlank(message = "El enlace de Google Maps es obligatorio")
    @Column(name = "google_maps_url", nullable = false, columnDefinition = "TEXT")
    private String googleMapsUrl;
    
    @NotNull(message = "El autor es obligatorio")
    @Column(name = "author_id", nullable = false)
    private Long authorId;
    
    @NotNull(message = "El estado es obligatorio")
    @Column(name = "state", nullable = false)
    private Boolean state = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 