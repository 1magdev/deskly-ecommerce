package com.app.deskly.model.user;

public interface AuthenticatedUser {
    Long getId();
    String getEmail();
    String getPasswordHash();
    boolean isActive();
}
