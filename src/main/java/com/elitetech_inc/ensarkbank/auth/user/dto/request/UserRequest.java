package com.elitetech_inc.ensarkbank.auth.user.dto.request;

import lombok.Data;

@Data
public class UserRequest {
    private String email;
    private String password;
}
