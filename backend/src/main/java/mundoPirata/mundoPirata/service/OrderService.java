package mundoPirata.mundoPirata.service;

import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.OrderDTO;
import mundoPirata.mundoPirata.dto.OrderCreateDTO;
import mundoPirata.mundoPirata.dto.OrderItemDTO;
import mundoPirata.mundoPirata.entity.*;
import mundoPirata.mundoPirata.repository.OrderRepository;
import mundoPirata.mundoPirata.repository.TicketRepository;
import mundoPirata.mundoPirata.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    
    public OrderDTO createOrder(OrderCreateDTO orderCreateDTO) {
        User user = userRepository.findById(orderCreateDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Crear la orden
        Order order = new Order();
        order.setUser(user);
        order.setPaymentMethod(orderCreateDTO.getPaymentMethod());
        order.setPurchaseState(Order.PurchaseState.pending);
        
        // Calcular el total y crear los items
        AtomicReference<BigDecimal> totalAmount = new AtomicReference<>(BigDecimal.ZERO);
        List<OrderItem> orderItems = orderCreateDTO.getItems().stream()
                .map(itemCreateDTO -> {
                    Ticket ticket = ticketRepository.findById(itemCreateDTO.getTicketId())
                            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
                    
                    if (!ticket.getAvailable()) {
                        throw new RuntimeException("El ticket " + ticket.getCode() + " no está disponible");
                    }
                    
                    // Calcular subtotal
                    BigDecimal subtotal = ticket.getPrice().multiply(BigDecimal.valueOf(itemCreateDTO.getQuantity()));
                    totalAmount.updateAndGet(current -> current.add(subtotal));
                    
                    // Crear item de orden
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setTicket(ticket);
                    orderItem.setQuantity(itemCreateDTO.getQuantity());
                    orderItem.setUnitPrice(ticket.getPrice());
                    orderItem.setSubtotal(subtotal);
                    
                    // Marcar ticket como vendido
                    ticket.setAvailable(false);
                    ticketRepository.save(ticket);
                    
                    return orderItem;
                })
                .collect(Collectors.toList());
        
        order.setTotalAmount(totalAmount.get());
        order.setOrderItems(orderItems);
        
        Order savedOrder = orderRepository.save(order);
        return convertToDTO(savedOrder);
    }
    
    public Optional<OrderDTO> getOrderById(Long orderId) {
        return orderRepository.findById(orderId).map(this::convertToDTO);
    }
    
    public Optional<Order> getOrderEntityById(Long orderId) {
        return orderRepository.findById(orderId);
    }
    
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<OrderDTO> getOrdersByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return orderRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<OrderDTO> getOrdersByState(Order.PurchaseState state) {
        return orderRepository.findByPurchaseState(state).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<OrderDTO> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByPurchaseDateBetween(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public void updateOrderState(Long orderId, Order.PurchaseState newState) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        
        order.setPurchaseState(newState);
        orderRepository.save(order);
    }
    
    public void updatePaymentId(Long orderId, String paymentId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        
        order.setPaymentId(paymentId);
        orderRepository.save(order);
    }
    
    public BigDecimal getTotalSales() {
        return orderRepository.getTotalSales();
    }
    
    public Long getApprovedOrdersCountBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.countApprovedOrdersBetween(startDate, endDate);
    }
    
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        
        // Cambiar estado a cancelado
        order.setPurchaseState(Order.PurchaseState.cancelled);
        
        // Liberar los tickets
        for (OrderItem item : order.getOrderItems()) {
            Ticket ticket = item.getTicket();
            ticket.setAvailable(true);
            ticketRepository.save(ticket);
        }
        
        orderRepository.save(order);
    }
    
    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setUserName(order.getUser().getName() + " " + order.getUser().getLastName());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setPurchaseDate(order.getPurchaseDate());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentId(order.getPaymentId());
        dto.setPurchaseState(order.getPurchaseState());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        
        // Convertir items
        List<OrderItemDTO> orderItemDTOs = order.getOrderItems().stream()
                .map(this::convertToItemDTO)
                .collect(Collectors.toList());
        dto.setOrderItems(orderItemDTOs);
        
        return dto;
    }
    
    private OrderItemDTO convertToItemDTO(OrderItem orderItem) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(orderItem.getId());
        dto.setOrderId(orderItem.getOrder().getId());
        dto.setTicketId(orderItem.getTicket().getId());
        dto.setTicketCode(orderItem.getTicket().getCode());
        dto.setLocationName(orderItem.getTicket().getLocation().getName());
        dto.setQuantity(orderItem.getQuantity());
        dto.setUnitPrice(orderItem.getUnitPrice());
        dto.setSubtotal(orderItem.getSubtotal());
        return dto;
    }
} 