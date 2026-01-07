package mundoPirata.mundoPirata.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "news_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El tipo es obligatorio")
    @Column(name = "type", nullable = false, length = 50)
    private String type;
} 