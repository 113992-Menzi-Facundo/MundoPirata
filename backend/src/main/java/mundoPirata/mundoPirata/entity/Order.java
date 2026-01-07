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
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "El usuario es obligatorio")
    private User user;
    
    @NotNull(message = "El monto total es obligatorio")
    @Positive(message = "El monto debe ser mayor a cero")
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(name = "purchase_date", nullable = false)
    private LocalDateTime purchaseDate = LocalDateTime.now();
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod = "Mercado Pago";
    
    @Column(name = "payment_id", length = 100)
    private String paymentId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_state", nullable = false)
    private PurchaseState purchaseState = PurchaseState.pending;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;
    
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