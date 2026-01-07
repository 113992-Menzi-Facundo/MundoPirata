package mundoPirata.mundoPirata.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mundoPirata.mundoPirata.dto.AuthResponseDTO;
import mundoPirata.mundoPirata.dto.LoginDTO;
import mundoPirata.mundoPirata.dto.UserDTO;
import mundoPirata.mundoPirata.entity.User;
import mundoPirata.mundoPirata.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    public AuthResponseDTO login(LoginDTO loginDTO) {
        log.info("Attempting login for email: {}", loginDTO.getEmail());

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginDTO.getEmail(),
                loginDTO.getPassword()
            )
        );

        UserDetails user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new IllegalStateException("User not found after authentication"));

        log.info("Authentication successful for user: {}", user.getUsername());
        
        String jwtToken = jwtService.generateToken(user);
        
        log.info("JWT token generated for user: {}", user.getUsername());

        return AuthResponseDTO.builder()
                .token(jwtToken)
                .build();
    }
    
    public UserDTO getUserByEmail(String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            return userService.convertToDTO(user);
        } catch (Exception e) {
            log.error("Error getting user by email: {}", e.getMessage());
            throw new RuntimeException("Usuario no encontrado");
        }
    }
} 