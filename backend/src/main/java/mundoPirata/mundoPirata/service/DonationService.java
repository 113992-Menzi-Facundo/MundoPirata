package mundoPirata.mundoPirata.service;

import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.DonationDTO;
import mundoPirata.mundoPirata.dto.DonationCreateDTO;
import mundoPirata.mundoPirata.dto.DonationStatsDTO;
import mundoPirata.mundoPirata.entity.Donation;
import mundoPirata.mundoPirata.entity.Destination;
import mundoPirata.mundoPirata.entity.User;
import mundoPirata.mundoPirata.repository.DonationRepository;
import mundoPirata.mundoPirata.repository.DestinationRepository;
import mundoPirata.mundoPirata.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DonationService {
    
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final EmailService emailService;
    
    public DonationDTO createDonation(DonationCreateDTO donationCreateDTO) {
        User user = userRepository.findById(donationCreateDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Destination destination = destinationRepository.findById(donationCreateDTO.getDestinationId())
                .orElseThrow(() -> new RuntimeException("Destino no encontrado"));
        
        Donation donation = new Donation();
        donation.setUser(user);
        donation.setDestination(destination);
        donation.setAmount(donationCreateDTO.getAmount());
        donation.setPaymentMethod(donationCreateDTO.getPaymentMethod());
        donation.setPurchaseState(Donation.PurchaseState.pending);
        
        Donation savedDonation = donationRepository.save(donation);
        return convertToDTO(savedDonation);
    }
    
    public Optional<DonationDTO> getDonationById(Long donationId) {
        return donationRepository.findById(donationId).map(this::convertToDTO);
    }
    
    public Optional<Donation> getDonationEntityById(Long donationId) {
        return donationRepository.findById(donationId);
    }
    
    public List<DonationDTO> getAllDonations() {
        return donationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<DonationDTO> getDonationsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return donationRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<DonationDTO> getDonationsByDestination(Long destinationId) {
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destino no encontrado"));
        
        return donationRepository.findByDestination(destination).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<DonationDTO> getDonationsByState(Donation.PurchaseState state) {
        return donationRepository.findByPurchaseState(state).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<DonationDTO> getDonationsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return donationRepository.findByDonationDateBetween(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public void updateDonationState(Long donationId, Donation.PurchaseState newState) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donación no encontrada"));
        
        Donation.PurchaseState oldState = donation.getPurchaseState();
        donation.setPurchaseState(newState);
        donationRepository.save(donation);
        
        // Enviar email de confirmación cuando se aprueba la donación
        if (newState == Donation.PurchaseState.approved && oldState != Donation.PurchaseState.approved) {
            try {
                emailService.sendDonationConfirmationEmail(
                    donation.getUser().getEmail(),
                    donation.getUser().getName() + " " + donation.getUser().getLastName(),
                    donation.getDestination().getName(),
                    donation.getAmount(),
                    donation.getPaymentId() != null ? donation.getPaymentId() : "N/A"
                );
            } catch (Exception e) {
                // Log error but don't fail the operation
                System.err.println("Error enviando email de confirmación: " + e.getMessage());
            }
        }
    }
    
    public void updatePaymentId(Long donationId, String paymentId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donación no encontrada"));
        
        donation.setPaymentId(paymentId);
        donationRepository.save(donation);
    }
    
    public BigDecimal getTotalDonations() {
        return donationRepository.getTotalDonationsByState(Donation.PurchaseState.approved);
    }
    
    public Long getApprovedDonationsCountBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return donationRepository.countDonationsByStateBetween(Donation.PurchaseState.approved, startDate, endDate);
    }
    
    public void cancelDonation(Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donación no encontrada"));
        
        donation.setPurchaseState(Donation.PurchaseState.cancelled);
        donationRepository.save(donation);
    }
    
    /**
     * Obtener estadísticas de donaciones con datos reales de la base de datos
     */
    public DonationStatsDTO getDonationStatistics() {
        // Obtener todas las donaciones aprobadas
        List<Donation> approvedDonations = donationRepository.findByPurchaseState(Donation.PurchaseState.approved);
        
        // Calcular estadísticas básicas
        Long totalDonations = (long) approvedDonations.size();
        BigDecimal totalAmount = approvedDonations.stream()
                .map(Donation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calcular donaciones del mes actual
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        
        BigDecimal monthlyAmount = donationRepository.getTotalDonationsByStateBetween(
                Donation.PurchaseState.approved, startOfMonth, endOfMonth);
        
        // Calcular promedio
        BigDecimal avgDonation = totalDonations > 0 ? 
                totalAmount.divide(BigDecimal.valueOf(totalDonations), 2, RoundingMode.HALF_UP) : 
                BigDecimal.ZERO;
        
        // Agrupar por destinación
        Map<String, List<Donation>> donationsByDestination = approvedDonations.stream()
                .collect(Collectors.groupingBy(d -> d.getDestination().getName()));
        
        List<DonationStatsDTO.DestinationStatsDTO> destinationStats = donationsByDestination.entrySet().stream()
                .map(entry -> {
                    String destinationName = entry.getKey();
                    List<Donation> donations = entry.getValue();
                    BigDecimal destinationAmount = donations.stream()
                            .map(Donation::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    Long destinationCount = (long) donations.size();
                    
                    return new DonationStatsDTO.DestinationStatsDTO(destinationName, destinationAmount, destinationCount);
                })
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount())) // Ordenar por monto descendente
                .collect(Collectors.toList());
        
        return new DonationStatsDTO(totalDonations, totalAmount, monthlyAmount, avgDonation, destinationStats);
    }

    private DonationDTO convertToDTO(Donation donation) {
        DonationDTO dto = new DonationDTO();
        dto.setId(donation.getId());
        dto.setUserId(donation.getUser().getId());
        dto.setUserName(donation.getUser().getName() + " " + donation.getUser().getLastName());
        dto.setDestinationId(donation.getDestination().getId());
        dto.setDestinationName(donation.getDestination().getName());
        dto.setDestinationAddress(donation.getDestination().getAddress());
        dto.setAmount(donation.getAmount());
        dto.setDonationDate(donation.getDonationDate());
        dto.setPaymentMethod(donation.getPaymentMethod());
        dto.setPaymentId(donation.getPaymentId());
        dto.setPurchaseState(donation.getPurchaseState());
        dto.setCreatedAt(donation.getCreatedAt());
        dto.setUpdatedAt(donation.getUpdatedAt());
        return dto;
    }
} 