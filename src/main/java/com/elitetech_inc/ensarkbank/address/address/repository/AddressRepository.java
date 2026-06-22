package com.elitetech_inc.ensarkbank.address.address.repository;


import com.elitetech_inc.ensarkbank.address.address.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {
}
