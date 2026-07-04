package com.elitetech_inc.ensarkbank.account_management.loan.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@Table(name = "loan_applications")
public class Loan extends BaseEntity {
}
