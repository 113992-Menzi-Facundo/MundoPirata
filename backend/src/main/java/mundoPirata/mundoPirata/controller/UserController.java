package mundoPirata.mundoPirata.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.UserDTO;
import mundoPirata.mundoPirata.dto.UserRegistrationDTO;
import mundoPirata.mundoPirata.dto.UserUpdateDTO;
import mundoPirata.mundoPirata.dto.UserAdminCreateDTO;
import mundoPirata.mundoPirata.dto.UserAdminUpdateDTO;
import mundoPirata.mundoPirata.entity.User;
import mundoPirata.mundoPirata.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Usuarios", description = "Gestión de usuarios del sistema")
public class UserController {
    
    private final UserService userService;
    
    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario", description = "Crea un nuevo usuario en el sistema y envía email de bienvenida. Verifica que el email no esté registrado previamente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Usuario creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Error en los datos del usuario o email ya registrado")
    })
    public ResponseEntity<UserDTO> registerUser(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        try {
            UserDTO createdUser = userService.registerUser(registrationDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID", description = "Retorna la información de un usuario específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserDTO> getUserById(@Parameter(description = "ID del usuario") @PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/email/{email}")
    @Operation(summary = "Obtener usuario por email", description = "Retorna la información de un usuario por su email")
    public ResponseEntity<UserDTO> getUserByEmail(@Parameter(description = "Email del usuario") @PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    @Operation(summary = "Obtener todos los usuarios", description = "Retorna la lista completa de usuarios registrados")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/role/{role}")
    @Operation(summary = "Obtener usuarios por rol", description = "Retorna todos los usuarios que tienen un rol específico")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@Parameter(description = "Rol del usuario") @PathVariable User.Role role) {
        List<UserDTO> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Buscar usuarios por nombre", description = "Busca usuarios que contengan el texto en su nombre o apellido")
    public ResponseEntity<List<UserDTO>> searchUsersByName(@Parameter(description = "Texto a buscar") @RequestParam String name) {
        List<UserDTO> users = userService.searchUsersByName(name);
        return ResponseEntity.ok(users);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario", description = "Actualiza la información básica de un usuario (nombre, apellido, DNI). No permite cambiar email, password o rol.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserDTO> updateUser(@Parameter(description = "ID del usuario") @PathVariable Long id, @Valid @RequestBody UserUpdateDTO userUpdateDTO) {
        try {
            UserDTO updatedUser = userService.updateUser(id, userUpdateDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/role")
    @Operation(summary = "Actualizar rol de usuario", description = "Cambia el rol de un usuario y envía notificación por email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rol actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserDTO> updateUserRole(@Parameter(description = "ID del usuario") @PathVariable Long id, 
                                                  @Parameter(description = "Nuevo rol") @RequestParam User.Role role) {
        try {
            UserDTO updatedUser = userService.updateUserRole(id, role);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar usuario", description = "Elimina un usuario del sistema. Esta operación no puede deshacerse.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Usuario eliminado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "400", description = "No se puede eliminar el usuario (ej: último administrador)")
    })
    public ResponseEntity<Void> deleteUser(@Parameter(description = "ID del usuario") @PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/admin/create")
    @Operation(summary = "Crear usuario por admin", description = "Permite a un administrador crear un usuario con rol específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Usuario creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Error en los datos del usuario o email ya registrado")
    })
    public ResponseEntity<UserDTO> createUserByAdmin(@Valid @RequestBody UserAdminCreateDTO createDTO) {
        try {
            UserDTO createdUser = userService.createUserByAdmin(createDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/admin/{id}")
    @Operation(summary = "Actualizar usuario por admin", description = "Permite a un administrador actualizar un usuario incluyendo su rol")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserDTO> updateUserByAdmin(@Parameter(description = "ID del usuario") @PathVariable Long id, 
                                                     @Valid @RequestBody UserAdminUpdateDTO updateDTO) {
        try {
            UserDTO updatedUser = userService.updateUserByAdmin(id, updateDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 