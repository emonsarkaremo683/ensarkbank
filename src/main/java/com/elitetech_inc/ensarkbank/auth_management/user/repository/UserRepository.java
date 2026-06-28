package com.elitetech_inc.ensarkbank.auth_management.user.repository;

import com.elitetech_inc.ensarkbank.auth_management.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
}
