package mundoPirata.mundoPirata.repository;

import mundoPirata.mundoPirata.entity.Order;
import mundoPirata.mundoPirata.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUser(User user);
    
    List<Order> findByPurchaseState(Order.PurchaseState state);
    
    List<Order> findByPurchaseDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.purchaseState = 'approved'")
    BigDecimal getTotalSales();
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.purchaseState = 'approved' AND o.purchaseDate BETWEEN :startDate AND :endDate")
    Long countApprovedOrdersBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
} 