package com.elitetech_inc.ensarkbank.bank_management.ledger.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "ledgers")
@Data

public class Ledger extends BaseEntity {


}
