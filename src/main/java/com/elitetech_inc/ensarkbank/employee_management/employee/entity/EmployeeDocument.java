package com.elitetech_inc.ensarkbank.employee_management.employee.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Table(name = "employee_documents")
@Entity
@Data
public class EmployeeDocument extends BaseEntity {

    private String doc_type;
    private String path;


    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
