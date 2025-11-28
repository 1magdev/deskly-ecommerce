package com.app.deskly.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.deskly.repository.AddressRepository;
import com.app.deskly.repository.CartRepository;

@Service
public class CheckoutService {

    @Autowired private CartRepository cartRepository;
    @Autowired private AddressRepository addressRepository;
/*

    */
/**
     * Inicia o processo de checkout
     *//*

    public CartDTO startCheckout(User user) {
        validateUser(user);

        Cart cart = getCartByUser(user);

        if (cart.getItems().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Carrinho vazio"
            );
        }

        return CartMapper.toDTO(cart);
    }

    */
/**
     * Lista endereços válidos para entrega
     *//*

    public List<Address> getDeliveryAddresses(User user) {
        validateUser(user);
        return addressRepository.findByUserAndDeliveryAddressTrue(user);
    }

    */
/**
     * Seleciona endereço de entrega
     *//*

    public CartDTO selectDeliveryAddress(User user, Long addressId) {
        validateUser(user);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Endereço não encontrado"
                ));

        // Valida se o endereço pertence ao usuário
        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Endereço não pertence ao usuário"
            );
        }

        // Valida se é endereço de entrega
        if (!address.isDeliveryAddress()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Endereço não marcado como endereço de entrega"
            );
        }

        Cart cart = getCartByUser(user);
        cart.setDeliveryAddress(address);
        cart.setDeliveryAddressSelected(true);

        Cart savedCart = cartRepository.save(cart);
        return CartMapper.toDTO(savedCart);
    }

    */
/**
     * Valida se endereço foi selecionado
     *//*

    public void validateDeliveryAddress(User user) {
        validateUser(user);

        Cart cart = getCartByUser(user);

        if (cart.getDeliveryAddress() == null || !cart.getDeliveryAddressSelected()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selecione um endereço de entrega"
            );
        }
    }

    */
/**
     * Retorna opções de frete disponíveis
     *//*

    public List<ShippingOptionDTO> getShippingOptions() {
        List<ShippingOptionDTO> options = new ArrayList<>();

        options.add(new ShippingOptionDTO(
            "default",
            "Frete Padrão",
            new BigDecimal("15.00"),
            "Entrega em até 7 dias úteis"
        ));

        options.add(new ShippingOptionDTO(
            "express",
            "Frete Expresso",
            new BigDecimal("30.00"),
            "Entrega em até 2 dias úteis"
        ));

        return options;
    }

    */
/**
     * Seleciona tipo de frete
     *//*

    public CartDTO selectShipping(User user, SelectShippingRequestDTO dto) {
        validateUser(user);

        if (dto.getShippingType() == null || dto.getShippingType().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe o tipo de frete"
            );
        }

        String shippingType = dto.getShippingType().toLowerCase();

        if (!shippingType.equals("default") && !shippingType.equals("express")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de frete inválido. Use 'default' ou 'express'"
            );
        }

        Cart cart = getCartByUser(user);

        // Define o tipo e custo do frete
        cart.setShippingType(shippingType);

        if (shippingType.equals("default")) {
            cart.setShippingCost(new BigDecimal("15.00"));
        } else {
            cart.setShippingCost(new BigDecimal("30.00"));
        }

        // Recalcula o subtotal incluindo o frete
        recalculateSubtotal(cart);

        Cart savedCart = cartRepository.save(cart);
        return CartMapper.toDTO(savedCart);
    }

    */
/**
     * Valida se frete foi selecionado
     *//*

    public void validateShipping(User user) {
        validateUser(user);

        Cart cart = getCartByUser(user);

        if (cart.getShippingType() == null || cart.getShippingCost() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selecione o tipo de frete"
            );
        }
    }

    */
/**
     * Recalcula subtotal incluindo frete
     *//*

    private void recalculateSubtotal(Cart cart) {
        BigDecimal itemsTotal = cart.getItems().stream()
                .map(item -> item.getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shipping = cart.getShippingCost() != null
                ? cart.getShippingCost()
                : BigDecimal.ZERO;

        cart.setSubtotal(itemsTotal.add(shipping));
    }

    */
/**
     * Retorna métodos de pagamento disponíveis
     *//*

    public String[] getPaymentMethods() {
        return new String[]{"BOLETO", "CARD"};
    }

    */
/**
     * Seleciona método de pagamento
     *//*

    public CartDTO selectPayment(User user, PaymentRequestDTO dto) {
        validateUser(user);

        if (dto.getMethod() == null || dto.getMethod().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe um método de pagamento"
            );
        }

        String method = dto.getMethod().toUpperCase();

        if (!method.equals("BOLETO") && !method.equals("CARD")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Método de pagamento inválido. Use BOLETO ou CARD"
            );
        }

        Cart cart = getCartByUser(user);
        cart.setPaymentMethod(method);

        if (method.equals("BOLETO")) {
            clearCardData(cart);
            cart.setPaymentInstallments(1);

        } else if (method.equals("CARD")) {
            validateCardData(dto);
            setCardData(cart, dto);
        }

        Cart savedCart = cartRepository.save(cart);
        return CartMapper.toDTO(savedCart);
    }

    */
/**
     * Valida se método de pagamento foi selecionado
     *//*

    public void validatePayment(User user) {
        validateUser(user);

        Cart cart = getCartByUser(user);

        if (cart.getPaymentMethod() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selecione um método de pagamento"
            );
        }

        if ("CARD".equalsIgnoreCase(cart.getPaymentMethod())) {
            validateSavedCardData(cart);
        }
    }

    */
/**
     * Finaliza o checkout (pode ser expandido para criar pedido)
     *//*

    public CartDTO finalizeCheckout(User user) {
        validateUser(user);

        Cart cart = getCartByUser(user);

        // Validações finais
        if (cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Carrinho vazio");
        }

        if (cart.getDeliveryAddress() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Endereço de entrega não selecionado");
        }

        if (cart.getShippingType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de frete não selecionado");
        }

        if (cart.getPaymentMethod() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Método de pagamento não selecionado");
        }

        // Aqui você pode criar o pedido (Order) e processar pagamento
        // TODO: Implementar criação de Order

        return CartMapper.toDTO(cart);
    }

    // ============== Métodos Auxiliares ==============

    private Cart getCartByUser(User user) {
        return cartRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Carrinho não encontrado"
                ));
    }

    private void validateUser(User user) {
        if (user == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuário não autenticado"
            );
        }
    }

    private void validateCardData(PaymentRequestDTO dto) {
        if (isBlank(dto.getCardNumber()) ||
            isBlank(dto.getCardCvv()) ||
            isBlank(dto.getCardHolderName()) ||
            isBlank(dto.getCardExpiration()) ||
            dto.getInstallments() == null ||
            dto.getInstallments() <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Preencha todos os dados do cartão"
            );
        }

        String cardNumber = dto.getCardNumber().replaceAll("\\s+", "");
        if (cardNumber.length() < 12) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Número de cartão inválido"
            );
        }
    }

    private void validateSavedCardData(Cart cart) {
        if (isBlank(cart.getPaymentCardHolderName()) ||
            isBlank(cart.getPaymentCardLastDigits()) ||
            isBlank(cart.getPaymentCardExpiration()) ||
            cart.getPaymentInstallments() == null ||
            cart.getPaymentInstallments() <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Dados do cartão incompletos"
            );
        }
    }

    private void setCardData(Cart cart, PaymentRequestDTO dto) {
        String cardNumber = dto.getCardNumber().replaceAll("\\s+", "");
        String lastDigits = cardNumber.substring(cardNumber.length() - 4);

        cart.setPaymentInstallments(dto.getInstallments());
        cart.setPaymentCardHolderName(dto.getCardHolderName());
        cart.setPaymentCardLastDigits(lastDigits);
        cart.setPaymentCardBrand(detectBrand(cardNumber));
        cart.setPaymentCardExpiration(dto.getCardExpiration());
    }

    private void clearCardData(Cart cart) {
        cart.setPaymentCardHolderName(null);
        cart.setPaymentCardLastDigits(null);
        cart.setPaymentCardBrand(null);
        cart.setPaymentCardExpiration(null);
    }

    private String detectBrand(String cardNumber) {
        if (cardNumber.startsWith("4")) return "VISA";
        if (cardNumber.startsWith("5")) return "MASTERCARD";
        if (cardNumber.startsWith("3")) return "AMEX";
        return "OUTROS";
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
*/
}
