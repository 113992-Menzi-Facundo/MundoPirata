package mundoPirata.mundoPirata.service;

import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.*;
import mundoPirata.mundoPirata.entity.Location;
import mundoPirata.mundoPirata.entity.Ticket;
import mundoPirata.mundoPirata.entity.Calendar;
import mundoPirata.mundoPirata.repository.LocationRepository;
import mundoPirata.mundoPirata.repository.TicketRepository;
import mundoPirata.mundoPirata.repository.CalendarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketService {
    
    private final TicketRepository ticketRepository;
    private final LocationRepository locationRepository;
    private final CalendarRepository calendarRepository;
    
    public TicketDTO createTicket(TicketCreateDTO ticketCreateDTO) {
        Location location = locationRepository.findById(ticketCreateDTO.getLocationId())
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada"));
        
        // Generar código único si no se proporciona
        String code = ticketCreateDTO.getCode();
        if (code == null || code.trim().isEmpty()) {
            code = generateUniqueCode();
        }
        
        Ticket ticket = new Ticket();
        ticket.setCode(code);
        ticket.setLocation(location);
        ticket.setPrice(ticketCreateDTO.getPrice());
        ticket.setDateTime(ticketCreateDTO.getDateTime());
        ticket.setAvailable(true);
        
        Ticket savedTicket = ticketRepository.save(ticket);
        return convertToDTO(savedTicket);
    }
    
    public Optional<TicketDTO> getTicketById(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .map(this::convertToDTO);
    }
    
    public Optional<TicketDTO> getTicketByCode(String code) {
        return ticketRepository.findByCode(code)
                .map(this::convertToDTO);
    }
    
    public List<TicketDTO> getAllAvailableTickets() {
        return ticketRepository.findByAvailableTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<TicketDTO> getTicketsByLocation(Long locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada"));
        
        return ticketRepository.findByLocation(location).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<TicketDTO> getAvailableTicketsByLocation(Long locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada"));
        
        return ticketRepository.findByLocationAndAvailableTrue(location).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<TicketDTO> getTicketsByDateTimeRange(LocalDateTime startDate, LocalDateTime endDate) {
        return ticketRepository.findByDateTimeBetween(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Long getAvailableTicketsCountByLocation(Long locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada"));
        
        return ticketRepository.countAvailableByLocation(location);
    }
    
    public Long getSoldTicketsCount() {
        return ticketRepository.countSoldTickets();
    }
    
    public void markTicketAsSold(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        if (!ticket.getAvailable()) {
            throw new RuntimeException("El ticket ya no está disponible");
        }
        
        ticket.setAvailable(false);
        ticketRepository.save(ticket);
    }
    
    public void markTicketAsAvailable(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        ticket.setAvailable(true);
        ticketRepository.save(ticket);
    }
    
    public void deleteTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        ticketRepository.delete(ticket);
    }
    
    public List<Ticket> getTicketsByIds(List<Long> ticketIds) {
        return ticketRepository.findAllById(ticketIds);
    }
    
    /**
     * Obtener eventos con entradas agrupados por evento del calendario
     * Mejorado para manejar múltiples eventos con el mismo rival en diferentes fechas
     */
    public List<EventWithTicketsDTO> getEventsWithTickets() {
        // Obtener TODOS los tickets (disponibles y vendidos)
        List<Ticket> allTickets = ticketRepository.findAll();
        
        if (allTickets.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Obtener todos los eventos activos del calendario
        List<Calendar> allCalendarEvents = calendarRepository.findByStateTrue();
        
        // Agrupar tickets por fecha+hora (redondeada a la hora) para distinguir eventos en la misma fecha
        // Usar una clave compuesta de fecha y hora (redondeada)
        Map<String, List<Ticket>> ticketsByDateTime = allTickets.stream()
                .collect(Collectors.groupingBy(ticket -> {
                    LocalDateTime dt = ticket.getDateTime();
                    // Redondear a la hora más cercana para agrupar tickets del mismo evento
                    LocalDateTime rounded = dt.withMinute(0).withSecond(0).withNano(0);
                    return rounded.toString();
                }));
        
        List<EventWithTicketsDTO> events = new ArrayList<>();
        Set<Long> processedCalendarEventIds = new HashSet<>();
        
        // Primero, procesar eventos del calendario y sus tickets correspondientes
        for (Calendar calendarEvent : allCalendarEvents) {
            LocalDate eventDate = calendarEvent.getDate();
            
            // Buscar tickets que corresponden a este evento del calendario
            // Los tickets deben estar en la misma fecha
            List<Ticket> eventTickets = allTickets.stream()
                    .filter(ticket -> ticket.getDateTime().toLocalDate().equals(eventDate))
                    .collect(Collectors.toList());
            
            if (eventTickets.isEmpty()) {
                continue; // No hay tickets para este evento
            }
            
            // Agrupar tickets por hora para manejar múltiples eventos en la misma fecha
            Map<String, List<Ticket>> ticketsByHour = eventTickets.stream()
                    .collect(Collectors.groupingBy(ticket -> {
                        LocalDateTime dt = ticket.getDateTime();
                        return dt.withMinute(0).withSecond(0).withNano(0).toString();
                    }));
            
            // Para cada grupo de tickets por hora, crear un evento
            for (Map.Entry<String, List<Ticket>> hourEntry : ticketsByHour.entrySet()) {
                List<Ticket> hourTickets = hourEntry.getValue();
                if (hourTickets.isEmpty()) continue;
                
                Ticket firstTicket = hourTickets.get(0);
                LocalDateTime ticketDateTime = firstTicket.getDateTime();
                
                // Verificar si ya procesamos este evento del calendario
                // Si hay múltiples eventos en la misma fecha, cada uno tendrá su propio grupo por hora
                Long eventId = calendarEvent.getId();
                
                // Si hay múltiples grupos de tickets (diferentes horas), procesar cada uno
                // Si solo hay un grupo y ya lo procesamos, saltarlo
                if (processedCalendarEventIds.contains(eventId) && ticketsByHour.size() == 1) {
                    continue;
                }
                
                processedCalendarEventIds.add(eventId);
                
                // Crear DTO para este evento
                EventWithTicketsDTO eventDTO = createEventDTO(
                    calendarEvent.getId(),
                    calendarEvent.getTitle(),
                    calendarEvent.getDetail() != null ? calendarEvent.getDetail() : "Partido de Liga Profesional",
                    calendarEvent.getEventType() != null ? calendarEvent.getEventType().getType() : "Partido",
                    ticketDateTime,
                    hourTickets
                );
                
                events.add(eventDTO);
            }
        }
        
        // Procesar tickets que no tienen evento del calendario asociado
        for (Map.Entry<String, List<Ticket>> entry : ticketsByDateTime.entrySet()) {
            List<Ticket> tickets = entry.getValue();
            if (tickets.isEmpty()) continue;
            
            Ticket firstTicket = tickets.get(0);
            LocalDate ticketDate = firstTicket.getDateTime().toLocalDate();
            
            // Verificar si estos tickets ya fueron procesados con un evento del calendario
            boolean alreadyProcessed = allCalendarEvents.stream()
                    .anyMatch(event -> event.getDate().equals(ticketDate));
            
            if (alreadyProcessed) {
                continue; // Ya procesado con evento del calendario
            }
            
            // Crear evento sin calendario (método legacy)
            String eventTitle = generateEventTitle(firstTicket.getDateTime());
            String eventDetail = generateEventDetail(eventTitle);
            String eventType = eventTitle.contains("Presentación") ? "Evento" : "Partido";
            Long eventId = (long) ticketDate.hashCode();
            
            EventWithTicketsDTO eventDTO = createEventDTO(
                eventId,
                eventTitle,
                eventDetail,
                eventType,
                firstTicket.getDateTime(),
                tickets
            );
            
            events.add(eventDTO);
        }
        
        // Ordenar eventos por fecha (más reciente primero)
        events.sort(Comparator.comparing(EventWithTicketsDTO::getEventDate).reversed());
        
        return events;
    }
    
    /**
     * Crear un EventWithTicketsDTO a partir de los datos del evento y sus tickets
     */
    private EventWithTicketsDTO createEventDTO(Long eventId, String eventTitle, String eventDetail, 
                                               String eventType, LocalDateTime eventDateTime, 
                                               List<Ticket> tickets) {
        // Agrupar tickets por ubicación
        Map<Long, List<Ticket>> ticketsByLocation = tickets.stream()
                .collect(Collectors.groupingBy(ticket -> ticket.getLocation().getId()));
        
        List<TicketsByLocationDTO> ticketsByLocationDTOs = new ArrayList<>();
        
        for (Map.Entry<Long, List<Ticket>> locationEntry : ticketsByLocation.entrySet()) {
            List<Ticket> locationTickets = locationEntry.getValue();
            if (locationTickets.isEmpty()) continue;
            
            Location location = locationTickets.get(0).getLocation();
            
            // Separar tickets disponibles y vendidos REALMENTE
            List<Ticket> availableTickets = locationTickets.stream()
                    .filter(Ticket::getAvailable)
                    .collect(Collectors.toList());
            
            List<Ticket> soldTickets = locationTickets.stream()
                    .filter(ticket -> !ticket.getAvailable())
                    .collect(Collectors.toList());
            
            // Convertir solo tickets disponibles a DTOs
            List<TicketDTO> ticketDTOs = availableTickets.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            // Crear LocationDTO
            LocationDTO locationDTO = new LocationDTO();
            locationDTO.setId(location.getId());
            locationDTO.setName(location.getName());
            locationDTO.setCapacity(location.getCapacity());
            locationDTO.setPrice(location.getPrice());
            
            // Crear TicketsByLocationDTO con datos REALES
            TicketsByLocationDTO ticketsByLocationDTO = new TicketsByLocationDTO();
            ticketsByLocationDTO.setLocation(locationDTO);
            ticketsByLocationDTO.setAvailableTickets(ticketDTOs);
            ticketsByLocationDTO.setAvailableCount(availableTickets.size());
            ticketsByLocationDTO.setSoldCount(soldTickets.size());
            
            ticketsByLocationDTOs.add(ticketsByLocationDTO);
        }
        
        // Crear EventWithTicketsDTO
        EventWithTicketsDTO eventDTO = new EventWithTicketsDTO();
        eventDTO.setEventId(eventId);
        eventDTO.setEventTitle(eventTitle);
        eventDTO.setEventDetail(eventDetail);
        eventDTO.setEventDate(eventDateTime);
        eventDTO.setEventType(eventType);
        eventDTO.setTickets(ticketsByLocationDTOs);
        
        return eventDTO;
    }
    
    private String generateEventDetail(String eventTitle) {
        if (eventTitle.contains("River Plate")) {
            return "El Millonario vuelve a Córdoba. Liga Profesional 2025 - Fecha 22. Revancha del histórico partido del ascenso de 2011.";
        } else if (eventTitle.contains("Boca Juniors")) {
            return "Superclásico en el Gigante de Alberdi. Liga Profesional 2025 - Fecha 18. El Xeneize visita Córdoba en un partido clave para la tabla de posiciones.";
        } else if (eventTitle.contains("Talleres")) {
            return "Derby Cordobés - El clásico provincial. Liga Profesional 2025 - Fecha 25. La ciudad se divide en dos colores.";
        } else if (eventTitle.contains("Racing Club")) {
            return "Partido por la fecha 15 del Torneo de la Liga. Estadio Julio César Villagra - 15:30hs";
        } else if (eventTitle.contains("San Lorenzo")) {
            return "Duelo de tradición. Liga Profesional 2025 - Fecha 28. Dos equipos históricos del fútbol argentino.";
        } else if (eventTitle.contains("Independiente")) {
            return "Clásico del Interior. Liga Profesional 2025 - Fecha 30. El Rojo visita el estadio Julio César Villagra.";
        } else if (eventTitle.contains("Presentación de refuerzos")) {
            return "Presentación oficial de los nuevos refuerzos para la segunda mitad del año. Conferencia de prensa con la dirigencia y firma de contratos en la sede del club.";
        } else if (eventTitle.contains("Festival Pirata")) {
            return "Cuarta edición del Festival Pirata con shows en vivo, actividades familiares y gastronomía. En los predios del club desde las 14:00 horas.";
        } else {
            return "Evento especial del Club Atlético Belgrano";
        }
    }
    
    private String generateUniqueCode() {
        return "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private TicketDTO convertToDTO(Ticket ticket) {
        TicketDTO dto = new TicketDTO();
        dto.setId(ticket.getId());
        dto.setCode(ticket.getCode());
        dto.setLocationId(ticket.getLocation().getId());
        dto.setLocationName(ticket.getLocation().getName());
        dto.setPrice(ticket.getPrice());
        dto.setDateTime(ticket.getDateTime());
        dto.setEventTitle(generateEventTitle(ticket.getDateTime()));
        dto.setAvailable(ticket.getAvailable());
        dto.setCreatedAt(ticket.getCreatedAt());
        return dto;
    }
    
    private String generateEventTitle(LocalDateTime dateTime) {
        // Lógica actualizada para generar títulos de eventos basados en la fecha
        // Ahora coincide con las fechas del script SQL
        LocalDate date = dateTime.toLocalDate();
        
        // Partidos de julio 2025
        if (date.equals(LocalDate.of(2025, 7, 15))) {
            return "Belgrano vs Boca Juniors";
        } 
        // Partidos de agosto 2025
        else if (date.equals(LocalDate.of(2025, 8, 2))) {
            return "Belgrano vs River Plate";
        } else if (date.equals(LocalDate.of(2025, 8, 16))) {
            return "Belgrano vs Talleres";
        } 
        // Partidos de septiembre 2025
        else if (date.equals(LocalDate.of(2025, 9, 1))) {
            return "Belgrano vs San Lorenzo";
        } else if (date.equals(LocalDate.of(2025, 9, 15))) {
            return "Belgrano vs Independiente";
        }
        // Partidos existentes (junio 2025)
        else if (date.equals(LocalDate.of(2025, 6, 15))) {
            return "Belgrano vs Racing Club";
        }
        // Eventos especiales
        else if (date.equals(LocalDate.of(2025, 7, 10))) {
            return "Presentación de refuerzos 2025";
        } else if (date.equals(LocalDate.of(2025, 7, 20))) {
            return "Festival Pirata 2025";
        } else {
            return "Evento - Club Atlético Belgrano";
        }
    }
} 