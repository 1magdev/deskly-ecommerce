package com.app.deskly.dto.order;

import com.app.deskly.model.OrderStatus;
import lombok.Data;

@Data
public class UpdateOrderStatusDTO {
    private OrderStatus status;
}
