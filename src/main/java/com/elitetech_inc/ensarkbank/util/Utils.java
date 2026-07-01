package com.elitetech_inc.ensarkbank.util;

import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.UUID;

@Service
public class Utils {

    public String generateReference() {
        String uuid = UUID.randomUUID().toString().replace("-", "").toUpperCase();
        return uuid.substring(0, 12);
    }

    public String generateRouteNumber(){
        final String fixedRoute = "6830";
        String randomPart = String.format("%05d",
                new Random().nextInt(100000));
        String accNumber =fixedRoute + randomPart;
        return accNumber;
    }
}
