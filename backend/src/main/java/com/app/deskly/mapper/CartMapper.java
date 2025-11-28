package com.app.deskly.mapper;

import java.util.stream.Collectors;

import com.app.deskly.dto.address.AddressResponseDTO;
import com.app.deskly.dto.cart.CartDTO;
import com.app.deskly.dto.cart.CartItemDTO;
import com.app.deskly.model.Cart;
import com.app.deskly.model.CartItem;

public class CartMapper {

    public static CartDTO toDTO(Cart cart) {
        if (cart == null) {
            return null;
        }

        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser() != null ? cart.getUser().getId() : null);

        if (cart.getDeliveryAddress() != null) {
            dto.setDeliveryAddress(AddressMapper.toResponseDTO(cart.getDeliveryAddress()));
        }

        dto.setShippingType(cart.getShippingType());
        dto.setShippingCost(cart.getShippingCost());
        dto.setSubtotal(cart.getSubtotal());
        dto.setDeliveryAddressSelected(cart.getDeliveryAddressSelected());

        dto.setPaymentMethod(cart.getPaymentMethod());
        dto.setPaymentInstallments(cart.getPaymentInstallments());
        dto.setPaymentCardHolderName(cart.getPaymentCardHolderName());
        dto.setPaymentCardLastDigits(cart.getPaymentCardLastDigits());
        dto.setPaymentCardBrand(cart.getPaymentCardBrand());
        dto.setPaymentCardExpiration(cart.getPaymentCardExpiration());

        if (cart.getItems() != null) {
            dto.setItems(cart.getItems().stream()
                    .map(CartMapper::toItemDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public static CartItemDTO toItemDTO(CartItem item) {
        if (item == null) {
            return null;
        }

        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setProduct(item.getProduct());
        dto.setQuantity(item.getQuantity());
        return dto;
    }
}
