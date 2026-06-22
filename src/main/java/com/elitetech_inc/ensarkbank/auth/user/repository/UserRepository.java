package com.elitetech_inc.ensarkbank.auth.user.repository;


import com.elitetech_inc.ensarkbank.auth.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
