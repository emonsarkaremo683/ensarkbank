package com.elitetech_inc.ensarkbank.address.district.entity;


import com.elitetech_inc.ensarkbank.address.division.entity.Division;
import com.elitetech_inc.ensarkbank.address.policestation.entity.PoliceStation;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "districts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class District extends BaseEntity {


    @Column(unique = true)
    private String name;

    @ManyToOne
    @JoinColumn(name = "divisionID")
    private Division division;

    @OneToMany(mappedBy = "district", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<PoliceStation> policeStations;
}
