package com.elitetech_inc.ensarkbank.address.address.entity;


import com.elitetech_inc.ensarkbank.address.policestation.entity.PoliceStation;
import com.elitetech_inc.ensarkbank.auth.user.entity.User;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;



@Data
@Entity
@Table(name = "addresses")
public class Address extends BaseEntity {

    private String holdingNo;
    private String area;
    private String postalCode;

    @ManyToOne
    @JoinColumn(name = "policestation_id")
    @JsonIgnore
    private PoliceStation policeStation;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

}
