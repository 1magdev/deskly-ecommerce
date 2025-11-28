package com.app.deskly.repository;

import com.app.deskly.model.user.User;
import com.app.deskly.model.UserRoles;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;


public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByCpf(String cpf);

    List<User> findByRole(UserRoles role);

}