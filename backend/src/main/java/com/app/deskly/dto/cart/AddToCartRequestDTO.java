package com.app.deskly.dto.cart;

public class AddToCartRequestDTO {

    private Long productId;

    public AddToCartRequestDTO() {}

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}

