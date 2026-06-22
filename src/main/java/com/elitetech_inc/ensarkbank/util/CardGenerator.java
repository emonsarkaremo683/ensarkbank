package com.elitetech_inc.ensarkbank.util;

import com.elitetech_inc.ensarkbank.customer_management.card.dto.request.CardRequest;
import com.ensark.elitebank.card.dto.request.CardRequest;
import org.springframework.stereotype.Component;
import java.util.Random;
import java.util.stream.IntStream;

import static com.elitetech_inc.ensarkbank.enums.CardNetwork.MASTERCARD;
import static com.elitetech_inc.ensarkbank.enums.CardNetwork.VISA;

@Component
public class CardGenerator {


    // Card number generator
    public String cardGenerator(CardRequest req){
        final String fixedCode = "683";

        String netCode = "";

        switch (req.getCardNetwork()){
            case VISA -> netCode = "4";
            case MASTERCARD -> netCode = "5";
            case null, default -> netCode = "6";
        }

        String code = "02";

        String randomPart = String.format("%09d",
                new Random().nextLong(1000000000));

        String digits = netCode + fixedCode + code + randomPart;
        return digits + lastDigit(digits);
    }

    // cvv number generator
    public String getCvv(){
        return String.format("%03d",
                new Random().nextInt(1000));
    }

    // Check Card is valid or not
    public Boolean isCardValid(String number){
        if (number == null || number.length() != 16) {
            return false;
        }

        int sum = IntStream.range(0, number.length())
                .map(i -> {
                    int digit = Character.getNumericValue(number.charAt(i));
                    if (i % 2 == 1) {
                        int multiplied = digit * 2;
                        return (multiplied > 9) ? multiplied - 9 : multiplied;
                    }
                    return digit;
                })
                .sum();
        return sum % 10 == 0;
    }

    // find out last digits
    private String lastDigit(String number){
        int sum = IntStream.range(0, number.length())
                .map(i -> {
                    int digit = Character.getNumericValue(number.charAt(i));
                    if (i % 2 == 1) {
                        int multiplied = digit * 2;
                        return (multiplied > 9) ? multiplied - 9 : multiplied;
                    }
                    return digit;
                })
                .sum();

        return String.valueOf((10 - (sum % 10)) % 10);
    }
}
