package com.ensark.ensarkbank.auth_management.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse<E>{
    private String token;
    private String tokenType;
    private E user;
}
