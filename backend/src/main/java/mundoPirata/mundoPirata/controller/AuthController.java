package mundoPirata.mundoPirata.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.AuthResponseDTO;
import mundoPirata.mundoPirata.dto.LoginDTO;
import mundoPirata.mundoPirata.dto.UserDTO;
import mundoPirata.mundoPirata.service.AuthService;
import mundoPirata.mundoPirata.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Autenticación", description = "Endpoints para login y obtención de datos de usuario")
public class AuthController {
    
    private final AuthService authService;
    private final UserService userService;
    
    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario y devuelve un token JWT.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login exitoso",
                content = @Content(schema = @Schema(implementation = AuthResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas"),
    })
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginDTO loginDTO) {
        AuthResponseDTO authResponse = authService.login(loginDTO);
        return ResponseEntity.ok(authResponse);
    }
    
    @GetMapping("/me")
    @Operation(summary = "Obtener usuario actual", 
               description = "Obtiene los datos del usuario autenticado actualmente a través del token JWT.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario obtenido exitosamente", 
                content = @Content(schema = @Schema(implementation = UserDTO.class))),
        @ApiResponse(responseCode = "401", description = "No autorizado, token inválido o ausente")
    })
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        UserDTO userDTO = userService.getUserFromUserDetails(userDetails);
        return ResponseEntity.ok(userDTO);
    }
} 