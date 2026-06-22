package com.elitetech_inc.ensarkbank.address.policestation.entity;


import com.elitetech_inc.ensarkbank.address.district.entity.District;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "policestations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PoliceStation extends BaseEntity {


    private String name;

    @ManyToOne
    @JoinColumn(name = "district_id")
    private District district;

//    @OneToMany(mappedBy = "policeStation",  fetch = FetchType.LAZY)
//    @JsonIgnore
//    private List<Branch> branches;

}
