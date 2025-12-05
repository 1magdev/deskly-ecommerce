package com.app.deskly.service;

import com.app.deskly.dto.address.AddressResponseDTO;
import com.app.deskly.dto.order.OrderItemRequestDTO;
import com.app.deskly.dto.order.OrderItemResponseDTO;
import com.app.deskly.dto.order.OrderRequestDTO;
import com.app.deskly.dto.order.OrderResponseDTO;
import com.app.deskly.model.Address;
import com.app.deskly.model.Order;
import com.app.deskly.model.OrderItem;
import com.app.deskly.model.OrderStatus;
import com.app.deskly.model.product.Product;
import com.app.deskly.model.user.Customer;
import com.app.deskly.repository.AddressRepository;
import com.app.deskly.repository.OrderItemRepository;
import com.app.deskly.repository.OrderRepository;
import com.app.deskly.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private AddressRepository addressRepository;
    @Autowired
    private ProductRepository productRepository;

    public OrderResponseDTO createOrder(Customer customer, OrderRequestDTO dto) {
        if (customer == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        Address address = addressRepository.findById(dto.getAddressId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereço não encontrado."));

        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Endereço não pertence ao usuário logado.");
        }

        BigDecimal totalValue = BigDecimal.ZERO;

        for (OrderItemRequestDTO itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            totalValue = totalValue.add(itemTotal);
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setAddress(address);
        order.setShippingValue(dto.getShippingValue());
        order.setTotalValue(totalValue.add(dto.getShippingValue()));

        Order saved = orderRepository.save(order);

        for (OrderItemRequestDTO itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(saved);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setUnitPrice(product.getPrice());

            orderItemRepository.save(orderItem);
        }

        return toResponse(saved);
    }

    public List<OrderResponseDTO> listOrders(Customer customer) {
        if (customer == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        List<Order> orders = orderRepository.findByCustomerOrderByCreatedAtDesc(customer);
        return orders.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderResponseDTO getOrder(Customer customer, Long id) {
        if (customer == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pedido não pertence ao usuário logado.");
        }

        return toResponse(order);
    }

    public Page<OrderResponseDTO> listAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        return orders.map(this::toResponse);
    }

    public OrderResponseDTO updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        return toResponse(updated);
    }

    private OrderResponseDTO toResponse(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setTotalValue(order.getTotalValue());
        dto.setShippingValue(order.getShippingValue());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());

        AddressResponseDTO addressDto = new AddressResponseDTO();
        addressDto.setId(order.getAddress().getId());
        addressDto.setLabel(order.getAddress().getLabel());
        addressDto.setStreet(order.getAddress().getStreet());
        addressDto.setNumber(order.getAddress().getNumber());
        addressDto.setComplement(order.getAddress().getComplement());
        addressDto.setDistrict(order.getAddress().getDistrict());
        addressDto.setCity(order.getAddress().getCity());
        addressDto.setState(order.getAddress().getState());
        addressDto.setZipCode(order.getAddress().getZipCode());
        dto.setAddress(addressDto);

        List<OrderItem> items = orderItemRepository.findByOrder(order);
        List<OrderItemResponseDTO> itemsDto = items.stream().map(item -> {
            OrderItemResponseDTO itemDto = new OrderItemResponseDTO();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductName(item.getProduct().getName());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setUnitPrice(item.getUnitPrice());
            itemDto.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(itemsDto);

        return dto;
    }
}
