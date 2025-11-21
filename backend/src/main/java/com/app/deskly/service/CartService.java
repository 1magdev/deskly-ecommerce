package com.app.deskly.service;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.app.deskly.model.Address;
import com.app.deskly.repository.AddressRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import com.app.deskly.dto.cart.PaymentRequestDTO;

import com.app.deskly.dto.cart.CartDTO;
import com.app.deskly.dto.cart.CartItemDTO;
import com.app.deskly.model.Product;
import com.app.deskly.model.User;
import com.app.deskly.repository.CartItemRepository;
import com.app.deskly.repository.CartRepository;
import com.app.deskly.repository.ProductRepository;

@Service
public class CartService {

    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private AddressRepository addressRepository;


    public void addProductToCart(String sessionId, User user, Long productId) {
        CartDTO cart;

        if (user != null) {
            cart = cartRepository.findByUser(user).orElse(new CartDTO());
            cart.setUser(user);
        } else {
            cart = cartRepository.findBySessionId(sessionId).orElse(new CartDTO());
            cart.setSessionId(sessionId);
        }

        Product product = productRepository.findById(productId).orElseThrow();
        Optional<CartItemDTO> existingItem = cart.getItems().stream()
            .filter(item -> item.getProduct().getId().equals(productId))
            .findFirst();

        if (existingItem.isPresent()) {
            CartItemDTO item = existingItem.get();
            item.setQuantity(item.getQuantity() + 1);
        } else {
            CartItemDTO item = new CartItemDTO();
            item.setProduct(product);
            item.setQuantity(1);
            item.setCart(cart);
            cart.getItems().add(item);
        }

        cartRepository.save(cart);
    }


    public void increaseItem(Long productId, String sessionId, User user) {
        CartDTO cart = findCart(sessionId, user);
        CartItemDTO item = findItem(cart, productId);

        item.setQuantity(item.getQuantity() + 1);
        cartItemRepository.save(item);

        recalculateSubtotal(cart);
        cartRepository.save(cart);
    }

    public void decreaseItem(Long productId, String sessionId, User user) {
        CartDTO cart = findCart(sessionId, user);
        CartItemDTO item = findItem(cart, productId);

        if (item.getQuantity() > 1) {
            item.setQuantity(item.getQuantity() - 1);
            cartItemRepository.save(item);
        } else {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        }

        recalculateSubtotal(cart);
        cartRepository.save(cart);
    }

    public void removeItem(Long productId, String sessionId, User user) {
        CartDTO cart = findCart(sessionId, user);
        CartItemDTO item = findItem(cart, productId);

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        recalculateSubtotal(cart);
        cartRepository.save(cart);
    }

    private void recalculateSubtotal(CartDTO cart) {
        BigDecimal subtotal = cart.getItems().stream()
            .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal frete = cart.getShippingCost() != null ? cart.getShippingCost() : BigDecimal.ZERO;

        cart.setSubtotal(subtotal.add(frete)); 
    }


     public CartDTO getCart(String sessionId, User user) {
        CartDTO cart;

        if (user != null) {
            Optional<CartDTO> userCartOpt = cartRepository.findByUser(user);

            if (userCartOpt.isPresent()) {
                cart = userCartOpt.get();
            } else {
                cart = cartRepository.findBySessionId(sessionId).orElseGet(() -> {
                    CartDTO novo = new CartDTO();
                    novo.setUser(user);
                    novo.setSessionId(sessionId);
                    novo.setShippingCost(BigDecimal.ZERO);
                    novo.setSubtotal(BigDecimal.ZERO);
                    return novo;
                });
            }

            cart.setUser(user);
            cart.setSessionId(sessionId);
        } else {
            cart = cartRepository.findBySessionId(sessionId).orElseGet(() -> {
                CartDTO novo = new CartDTO();
                novo.setSessionId(sessionId);
                novo.setShippingCost(BigDecimal.ZERO);
                novo.setSubtotal(BigDecimal.ZERO);
                return novo;
            });
        }

        recalculateSubtotal(cart);
        return cartRepository.save(cart);
    }

    public CartDTO checkout(String sessionId, User user) {
        if (user == null) {
            throw new RuntimeException("Usuário não autenticado para checkout.");
        }

        Optional<CartDTO> userCartOpt = cartRepository.findByUser(user);
        Optional<CartDTO> sessionCartOpt = cartRepository.findBySessionId(sessionId);

        CartDTO cart;

        if (userCartOpt.isPresent() && sessionCartOpt.isPresent()
                && !userCartOpt.get().getId().equals(sessionCartOpt.get().getId())) {

            cart = userCartOpt.get();
            CartDTO guestCart = sessionCartOpt.get();

            for (CartItemDTO guestItem : guestCart.getItems()) {
                Optional<CartItemDTO> existingOpt = cart.getItems().stream()
                        .filter(i -> i.getProduct().getId().equals(guestItem.getProduct().getId()))
                        .findFirst();

                if (existingOpt.isPresent()) {
                    CartItemDTO existing = existingOpt.get();
                    existing.setQuantity(existing.getQuantity() + guestItem.getQuantity());
                } else {
                    CartItemDTO cloned = new CartItemDTO();
                    cloned.setCart(cart);
                    cloned.setProduct(guestItem.getProduct());
                    cloned.setQuantity(guestItem.getQuantity());
                    cart.getItems().add(cloned);
                }
            }

            cartRepository.delete(guestCart);
        } else if (userCartOpt.isPresent()) {
            cart = userCartOpt.get();
        } else if (sessionCartOpt.isPresent()) {
            cart = sessionCartOpt.get();
        } else {
            cart = new CartDTO();
            cart.setUser(user);
            cart.setSessionId(sessionId);
            cart.setShippingCost(BigDecimal.ZERO);
            cart.setSubtotal(BigDecimal.ZERO);
        }

        cart.setUser(user);
        cart.setSessionId(sessionId);

        recalculateSubtotal(cart);
        return cartRepository.save(cart);
    }

        public List<Address> getValidDeliveryAddresses(User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        return addressRepository.findByUserAndDeliveryAddressTrue(user);
    }

        public CartDTO selectDeliveryAddress(String sessionId, User user, Long addressId) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereço não encontrado."));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Endereço não pertence ao usuário logado.");
        }

        if (!address.isDeliveryAddress()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Endereço não está marcado como de entrega.");
        }

        CartDTO cart = findCart(sessionId, user); 

        cart.setUser(user);
        cart.setDeliveryAddress(address);

        recalculateSubtotal(cart); 

        return cartRepository.save(cart);
    }

        public void validateDeliveryAddressSelected(String sessionId, User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        CartDTO cart = findCart(sessionId, user);

        if (cart.getDeliveryAddress() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selecione um endereço de entrega antes de prosseguir para o pagamento."
            );
        }
    }


        private CartDTO findCart(String sessionId, User user) {
        if (user != null) {
            Optional<CartDTO> userCartOpt = cartRepository.findByUser(user);
            if (userCartOpt.isPresent()) {
                return userCartOpt.get();
            }

            if (sessionId != null) {
                Optional<CartDTO> sessionCartOpt = cartRepository.findBySessionId(sessionId);
                if (sessionCartOpt.isPresent()) {
                    CartDTO cart = sessionCartOpt.get();
                    cart.setUser(user);
                    return cart;
                }
            }

            CartDTO novo = new CartDTO();
            novo.setUser(user);
            novo.setSessionId(sessionId);
            novo.setShippingCost(BigDecimal.ZERO);
            novo.setSubtotal(BigDecimal.ZERO);
            return novo;
        } else {
            return cartRepository.findBySessionId(sessionId).orElseGet(() -> {
                CartDTO novo = new CartDTO();
                novo.setSessionId(sessionId);
                novo.setShippingCost(BigDecimal.ZERO);
                novo.setSubtotal(BigDecimal.ZERO);
                return novo;
            });
        }
    }


    private CartItemDTO findItem(CartDTO cart, Long productId) {
        return cart.getItems().stream()
            .filter(item -> item.getProduct().getId().equals(productId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Produto não encontrado no carrinho"));
    }

        public CartDTO selectPayment(String sessionId, User user, PaymentRequestDTO dto) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        if (dto.getMethod() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe uma forma de pagamento.");
        }

        String method = dto.getMethod().toUpperCase();

        if (!method.equals("BOLETO") && !method.equals("CARD")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Forma de pagamento inválida.");
        }

        CartDTO cart = findCart(sessionId, user);

        cart.setPaymentMethod(method);

        if (method.equals("BOLETO")) {
            cart.setPaymentInstallments(1);
            cart.setPaymentCardHolderName(null);
            cart.setPaymentCardLastDigits(null);
            cart.setPaymentCardBrand(null);
            cart.setPaymentCardExpiration(null);

        } else if (method.equals("CARD")) {
            if (isBlank(dto.getCardNumber()) ||
                isBlank(dto.getCardCvv()) ||
                isBlank(dto.getCardHolderName()) ||
                isBlank(dto.getCardExpiration()) ||
                dto.getInstallments() == null || dto.getInstallments() <= 0) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Preencha todos os dados do cartão e a quantidade de parcelas."
                );
            }

            String cardNumber = dto.getCardNumber().replaceAll("\\s+", "");
            if (cardNumber.length() < 12) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Número de cartão inválido."
                );
            }

            String lastDigits = cardNumber.substring(cardNumber.length() - 4);

            cart.setPaymentInstallments(dto.getInstallments());
            cart.setPaymentCardHolderName(dto.getCardHolderName());
            cart.setPaymentCardLastDigits(lastDigits);
            cart.setPaymentCardBrand(detectBrand(cardNumber)); 
            cart.setPaymentCardExpiration(dto.getCardExpiration());
        }

        return cartRepository.save(cart);
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String detectBrand(String cardNumber) {
        if (cardNumber.startsWith("4")) {
            return "VISA";
        }
        if (cardNumber.startsWith("5")) {
            return "MASTERCARD";
        }
        return "DESCONHECIDA";
    }

        public void validatePaymentSelected(String sessionId, User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        CartDTO cart = findCart(sessionId, user);

        if (cart.getPaymentMethod() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selecione uma forma de pagamento antes de prosseguir."
            );
        }

        if ("CARD".equalsIgnoreCase(cart.getPaymentMethod())) {
            if (isBlank(cart.getPaymentCardHolderName()) ||
                isBlank(cart.getPaymentCardLastDigits()) ||
                isBlank(cart.getPaymentCardExpiration()) ||
                cart.getPaymentInstallments() == null ||
                cart.getPaymentInstallments() <= 0) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Preencha os dados do cartão antes de prosseguir."
                );
            }
        }

    }


}

