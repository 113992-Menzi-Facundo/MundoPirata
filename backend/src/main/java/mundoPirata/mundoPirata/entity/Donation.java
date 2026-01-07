package mundoPirata.mundoPirata.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "El usuario es obligatorio")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    @NotNull(message = "El destino es obligatorio")
    private Destination destination;
    
    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a cero")
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "donation_date", nullable = false)
    private LocalDateTime donationDate = LocalDateTime.now();
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod = "Mercado Pago";
    
    @Column(name = "payment_id", length = 100)
    private String paymentId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_state", nullable = false)
    private PurchaseState purchaseState = PurchaseState.pending;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum PurchaseState {
        pending, approved, rejected, cancelled
    }
} 