package mundoPirata.mundoPirata.service;

import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.CalendarDTO;
import mundoPirata.mundoPirata.dto.CalendarCreateDTO;
import mundoPirata.mundoPirata.dto.CalendarUpdateDTO;
import mundoPirata.mundoPirata.entity.Calendar;
import mundoPirata.mundoPirata.entity.EventType;
import mundoPirata.mundoPirata.entity.User;
import mundoPirata.mundoPirata.entity.Ticket;
import mundoPirata.mundoPirata.repository.CalendarRepository;
import mundoPirata.mundoPirata.repository.EventTypeRepository;
import mundoPirata.mundoPirata.repository.UserRepository;
import mundoPirata.mundoPirata.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CalendarService {
    
    private final CalendarRepository calendarRepository;
    private final EventTypeRepository eventTypeRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    
    public CalendarDTO createEvent(CalendarCreateDTO calendarCreateDTO) {
        User author = userRepository.findById(calendarCreateDTO.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Autor no encontrado"));
        
        EventType eventType = eventTypeRepository.findById(calendarCreateDTO.getEventTypeId())
                .orElseThrow(() -> new RuntimeException("Tipo de evento no encontrado"));
        
        Calendar event = new Calendar();
        event.setTitle(calendarCreateDTO.getTitle());
        event.setDetail(calendarCreateDTO.getDetail());
        event.setAuthor(author);
        event.setDate(calendarCreateDTO.getDate());
        event.setEventType(eventType);
        event.setState(true);
        
        Calendar savedEvent = calendarRepository.save(event);
        return convertToDTO(savedEvent);
    }
    
    public CalendarDTO updateEvent(Long eventId, CalendarUpdateDTO calendarUpdateDTO) {
        Calendar event = calendarRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        if (calendarUpdateDTO.getTitle() != null && !calendarUpdateDTO.getTitle().trim().isEmpty()) {
            event.setTitle(calendarUpdateDTO.getTitle());
        }
        
        if (calendarUpdateDTO.getDetail() != null) {
            event.setDetail(calendarUpdateDTO.getDetail());
        }
        
        if (calendarUpdateDTO.getDate() != null) {
            event.setDate(calendarUpdateDTO.getDate());
        }
        
        if (calendarUpdateDTO.getEventTypeId() != null) {
            EventType eventType = eventTypeRepository.findById(calendarUpdateDTO.getEventTypeId())
                    .orElseThrow(() -> new RuntimeException("Tipo de evento no encontrado"));
            event.setEventType(eventType);
        }
        
        Calendar updatedEvent = calendarRepository.save(event);
        return convertToDTO(updatedEvent);
    }
    
    public Optional<CalendarDTO> getEventById(Long eventId) {
        return calendarRepository.findById(eventId)
                .map(this::convertToDTO);
    }
    
    public List<CalendarDTO> getAllActiveEvents() {
        return calendarRepository.findByStateTrueOrderByDate().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<CalendarDTO> getAllEvents() {
        return calendarRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<CalendarDTO> getEventsByType(Long typeId) {
        EventType eventType = eventTypeRepository.findById(typeId)
                .orElseThrow(() -> new RuntimeException("Tipo de evento no encontrado"));
        
        return calendarRepository.findByEventType(eventType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<CalendarDTO> getEventsByDateRange(LocalDate startDate, LocalDate endDate) {
        return calendarRepository.findByDateBetween(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<CalendarDTO> getEventsByDate(LocalDate date) {
        return calendarRepository.findByDate(date).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<CalendarDTO> getUpcomingEvents() {
        LocalDate today = LocalDate.now();
        return calendarRepository.findByDateBetween(today, today.plusMonths(3)).stream()
                .filter(event -> event.getState())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public void toggleEventState(Long eventId) {
        Calendar event = calendarRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        event.setState(!event.getState());
        calendarRepository.save(event);
    }
    
    public void deleteEvent(Long eventId) {
        Calendar event = calendarRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        // Encontrar todas las entradas asociadas a este evento por fecha
        LocalDate eventDate = event.getDate();
        LocalDateTime startOfDay = eventDate.atStartOfDay();
        LocalDateTime endOfDay = eventDate.atTime(23, 59, 59);
        
        // Buscar entradas que coincidan con la fecha del evento
        List<Ticket> allTickets = ticketRepository.findByDateTimeBetween(startOfDay, endOfDay);
        
        // Verificar si hay entradas vendidas (available = false)
        List<Ticket> soldTickets = allTickets.stream()
                .filter(ticket -> !ticket.getAvailable())
                .collect(Collectors.toList());
        
        System.out.println("🗑️ Intentando eliminar evento: " + event.getTitle() + " (Fecha: " + eventDate + ")");
        System.out.println("🎫 Total entradas: " + allTickets.size());
        System.out.println("💰 Entradas vendidas: " + soldTickets.size());
        
        // VALIDACIÓN: No permitir eliminar si hay entradas vendidas
        if (!soldTickets.isEmpty()) {
            throw new RuntimeException("No se puede eliminar el evento '" + event.getTitle() + 
                "' porque ya se vendieron " + soldTickets.size() + " entrada(s). " +
                "Solo se pueden eliminar eventos sin ventas.");
        }
        
        // Si llegamos aquí, no hay entradas vendidas, podemos eliminar
        System.out.println("✅ No hay entradas vendidas, procediendo con la eliminación...");
        
        // Eliminar físicamente todas las entradas disponibles
        if (!allTickets.isEmpty()) {
            ticketRepository.deleteAll(allTickets);
            System.out.println("✅ " + allTickets.size() + " entradas disponibles eliminadas");
        }
        
        // Eliminar físicamente el evento del calendario
        calendarRepository.delete(event);
        System.out.println("✅ Evento '" + event.getTitle() + "' eliminado del calendario");
    }
    
    private CalendarDTO convertToDTO(Calendar event) {
        CalendarDTO dto = new CalendarDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDetail(event.getDetail());
        dto.setAuthorId(event.getAuthor().getId());
        dto.setAuthorName(event.getAuthor().getName() + " " + event.getAuthor().getLastName());
        dto.setDate(event.getDate());
        dto.setEventTypeId(event.getEventType().getId());
        dto.setEventTypeDescription(event.getEventType().getType());
        dto.setState(event.getState());
        dto.setCreatedAt(event.getCreatedAt());
        dto.setUpdatedAt(event.getUpdatedAt());
        return dto;
    }
} 