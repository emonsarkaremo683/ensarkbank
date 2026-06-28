package com.elitetech_inc.ensarkbank.atm.service;

import com.elitetech_inc.ensarkbank.atm.dto.request.AtmRequest;
import com.elitetech_inc.ensarkbank.atm.dto.response.AtmResponse;
import org.springframework.stereotype.Service;

@Service
public interface AtmService {
    AtmResponse createAtm(AtmRequest atmRequest);
}
