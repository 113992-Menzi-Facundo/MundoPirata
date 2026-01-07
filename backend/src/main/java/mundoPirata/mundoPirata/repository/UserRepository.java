package mundoPirata.mundoPirata.repository;

import mundoPirata.mundoPirata.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    boolean existsByDni(Long dni);
    
    List<User> findByRole(User.Role role);
    
    long countByRole(User.Role role);
    
    @Query("SELECT u FROM User u WHERE u.name LIKE %:name% OR u.lastName LIKE %:name%")
    List<User> findByNameContaining(@Param("name") String name);
} 