package com.elitetech_inc.ensarkbank.common.address.division.repository;



import com.elitetech_inc.ensarkbank.common.address.division.entity.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface DivisionRepository extends JpaRepository<Division, Long> {


}
