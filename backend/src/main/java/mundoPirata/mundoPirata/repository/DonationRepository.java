package mundoPirata.mundoPirata.repository;

import mundoPirata.mundoPirata.entity.Donation;
import mundoPirata.mundoPirata.entity.Destination;
import mundoPirata.mundoPirata.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    
    List<Donation> findByUser(User user);
    
    List<Donation> findByDestination(Destination destination);
    
    List<Donation> findByPurchaseState(Donation.PurchaseState state);
    
    List<Donation> findByDonationDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Donation d WHERE d.purchaseState = :state")
    BigDecimal getTotalDonationsByState(@Param("state") Donation.PurchaseState state);
    
    @Query("SELECT COUNT(d) FROM Donation d WHERE d.purchaseState = :state AND d.donationDate BETWEEN :startDate AND :endDate")
    Long countDonationsByStateBetween(@Param("state") Donation.PurchaseState state, 
                                     @Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Donation d WHERE d.purchaseState = :state AND d.donationDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalDonationsByStateBetween(@Param("state") Donation.PurchaseState state,
                                              @Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);
} 