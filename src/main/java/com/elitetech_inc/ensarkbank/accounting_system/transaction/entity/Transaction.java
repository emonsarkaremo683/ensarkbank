package com.elitetech_inc.ensarkbank.accounting_system.transaction.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "transactions")
@Data
public class Transaction extends BaseEntity {

}
