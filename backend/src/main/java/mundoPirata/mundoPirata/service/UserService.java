package mundoPirata.mundoPirata.service;

import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.UserDTO;
import mundoPirata.mundoPirata.dto.UserRegistrationDTO;
import mundoPirata.mundoPirata.dto.UserUpdateDTO;
import mundoPirata.mundoPirata.dto.UserAdminCreateDTO;
import mundoPirata.mundoPirata.dto.UserAdminUpdateDTO;
import mundoPirata.mundoPirata.entity.User;
import mundoPirata.mundoPirata.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    
    public UserDTO registerUser(UserRegistrationDTO registrationDTO) {
        // Verificar si el email ya existe
        if (userRepository.existsByEmail(registrationDTO.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }
        
        // Crear usuario
        User user = new User();
        user.setName(registrationDTO.getName());
        user.setLastName(registrationDTO.getLastName());
        user.setEmail(registrationDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        user.setRole(User.Role.user); // Por defecto user
        user.setEnabled(true); // Usuario activado por defecto
        
        User savedUser = userRepository.save(user);
        
        // Enviar email de bienvenida
        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getName());
        
        return convertToDTO(savedUser);
    }
    
    public UserDTO updateUser(Long userId, UserUpdateDTO userUpdateDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        user.setName(userUpdateDTO.getName());
        user.setLastName(userUpdateDTO.getLastName());
        user.setDni(userUpdateDTO.getDni());
        
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
    
    public UserDTO updateUserRole(Long userId, User.Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        User.Role oldRole = user.getRole();
        user.setRole(newRole);
        
        User updatedUser = userRepository.save(user);
        
        // Enviar email de notificación de cambio de rol
        emailService.sendRoleChangeEmail(user.getEmail(), user.getName(), oldRole, newRole);
        
        return convertToDTO(updatedUser);
    }
    
    public Optional<UserDTO> getUserById(Long userId) {
        return userRepository.findById(userId)
                .map(this::convertToDTO);
    }
    
    public Optional<UserDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::convertToDTO);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<UserDTO> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<UserDTO> searchUsersByName(String name) {
        return userRepository.findByNameContaining(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar que no se elimine el último administrador
        if (user.getRole() == User.Role.admin) {
            long adminCount = userRepository.countByRole(User.Role.admin);
            if (adminCount <= 1) {
                throw new IllegalStateException("No se puede eliminar el último administrador del sistema");
            }
        }
        
        userRepository.delete(user);
    }
    
    public UserDTO getUserFromUserDetails(UserDetails userDetails) {
        if (userDetails == null) {
            return null;
        }
        return userRepository.findByEmail(userDetails.getUsername())
            .map(this::convertToDTO)
            .orElseThrow(() -> new RuntimeException("User not found from UserDetails"));
    }
    
    public UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setDni(user.getDni());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
    
    public UserDTO createUserByAdmin(UserAdminCreateDTO createDTO) {
        // Verificar si el email ya existe
        if (userRepository.existsByEmail(createDTO.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }
        
        // Crear usuario
        User user = new User();
        user.setName(createDTO.getName());
        user.setLastName(createDTO.getLastName());
        user.setEmail(createDTO.getEmail());
        user.setPassword(passwordEncoder.encode(createDTO.getPassword()));
        user.setRole(createDTO.getRole());
        user.setDni(createDTO.getDni());
        user.setEnabled(true); // Usuario activado por defecto
        
        User savedUser = userRepository.save(user);
        
        // Enviar email de bienvenida
        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getName());
        
        return convertToDTO(savedUser);
    }
    
    public UserDTO updateUserByAdmin(Long userId, UserAdminUpdateDTO updateDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        User.Role oldRole = user.getRole();
        
        user.setName(updateDTO.getName());
        user.setLastName(updateDTO.getLastName());
        user.setRole(updateDTO.getRole());
        user.setDni(updateDTO.getDni());
        
        User updatedUser = userRepository.save(user);
        
        // Si cambió el rol, enviar email de notificación
        if (oldRole != updateDTO.getRole()) {
            emailService.sendRoleChangeEmail(user.getEmail(), user.getName(), oldRole, updateDTO.getRole());
        }
        
        return convertToDTO(updatedUser);
    }
} 