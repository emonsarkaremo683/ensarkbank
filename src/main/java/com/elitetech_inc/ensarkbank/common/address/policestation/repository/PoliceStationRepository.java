package com.elitetech_inc.ensarkbank.common.address.policestation.repository;



import com.elitetech_inc.ensarkbank.common.address.policestation.entity.PoliceStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PoliceStationRepository extends JpaRepository<PoliceStation, Long> {

}
