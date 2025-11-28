package com.app.deskly.repository;

import com.app.deskly.model.Backoffice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BackofficeRepository extends JpaRepository<Backoffice, Long> {
    Optional<Backoffice> findByEmail(String email);
}
