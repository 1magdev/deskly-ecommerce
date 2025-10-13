package com.app.deskly.dto.cart;

public class AddToCartRequest {

    private Long productId;

    public AddToCartRequest() {}

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}

