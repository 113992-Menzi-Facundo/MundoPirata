package mundoPirata.mundoPirata.service;

import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.DestinationCreateDTO;
import mundoPirata.mundoPirata.dto.DestinationDTO;
import mundoPirata.mundoPirata.entity.Destination;
import mundoPirata.mundoPirata.repository.DestinationRepository;
import mundoPirata.mundoPirata.repository.DonationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DestinationService {
    
    private final DestinationRepository destinationRepository;
    private final DonationRepository donationRepository;
    
    public List<DestinationDTO> getAllDestinations() {
        return destinationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<DestinationDTO> getActiveDestinations() {
        return destinationRepository.findByStateTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<DestinationDTO> getDestinationById(Long id) {
        return destinationRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    public DestinationDTO createDestination(DestinationCreateDTO createDTO) {
        Destination destination = new Destination();
        destination.setName(createDTO.getName());
        destination.setAddress(createDTO.getAddress());
        destination.setPhoneNumber(createDTO.getPhoneNumber());
        destination.setState(true); // Nueva destinación activa por defecto
        
        Destination savedDestination = destinationRepository.save(destination);
        return convertToDTO(savedDestination);
    }
    
    public DestinationDTO updateDestination(Long id, DestinationDTO destinationDTO) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destinación no encontrada"));
        
        destination.setName(destinationDTO.getName());
        destination.setAddress(destinationDTO.getAddress());
        destination.setPhoneNumber(destinationDTO.getPhoneNumber());
        destination.setState(destinationDTO.getState());
        
        Destination savedDestination = destinationRepository.save(destination);
        return convertToDTO(savedDestination);
    }
    
    public DestinationDTO toggleDestinationState(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destinación no encontrada"));
        
        destination.setState(!destination.getState());
        Destination savedDestination = destinationRepository.save(destination);
        return convertToDTO(savedDestination);
    }
    
    public void deleteDestination(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destinación no encontrada"));
        
        // Verificar si tiene donaciones asociadas
        boolean hasDonations = donationRepository.findByDestination(destination).size() > 0;
        if (hasDonations) {
            throw new IllegalStateException("No se puede eliminar una destinación que tiene donaciones asociadas");
        }
        
        destinationRepository.delete(destination);
    }
    
    private DestinationDTO convertToDTO(Destination destination) {
        DestinationDTO dto = new DestinationDTO();
        dto.setId(destination.getId());
        dto.setName(destination.getName());
        dto.setAddress(destination.getAddress());
        dto.setPhoneNumber(destination.getPhoneNumber());
        dto.setState(destination.getState());
        return dto;
    }
} 