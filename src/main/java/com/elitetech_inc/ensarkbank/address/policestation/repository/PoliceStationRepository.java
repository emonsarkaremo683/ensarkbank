package com.elitetech_inc.ensarkbank.address.policestation.repository;



import com.elitetech_inc.ensarkbank.address.policestation.entity.PoliceStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PoliceStationRepository extends JpaRepository<PoliceStation, Long> {

}
