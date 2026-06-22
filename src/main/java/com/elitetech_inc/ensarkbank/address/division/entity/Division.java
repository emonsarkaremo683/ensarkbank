package com.elitetech_inc.ensarkbank.address.division.entity;


import com.elitetech_inc.ensarkbank.address.district.entity.District;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "divisions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Division extends BaseEntity {

    @Column(unique = true)
    private String name;


    @OneToMany(mappedBy = "division",  fetch = FetchType.LAZY)
    @JsonIgnore
    private List<District> districts = new ArrayList<>();
}
