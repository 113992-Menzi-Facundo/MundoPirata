package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mundoPirata.mundoPirata.entity.User;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    private Long id;
    private String name;
    private String lastName;
    private String email;
    private User.Role role;
    private Long dni;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 