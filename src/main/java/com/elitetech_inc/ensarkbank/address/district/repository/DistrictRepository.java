package com.elitetech_inc.ensarkbank.address.district.repository;



import com.elitetech_inc.ensarkbank.address.district.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {

}
