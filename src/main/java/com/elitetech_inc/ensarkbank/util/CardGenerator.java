package com.elitetech_inc.ensarkbank.util;

// import com.elitetech_inc.ensarkbank.customer_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.common.enums.CardNetwork;
import com.elitetech_inc.ensarkbank.common.enums.CardType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Random;
import java.util.stream.IntStream;

@Component
public class CardGenerator {


    // Card number generator
    public String cardGenerator(CardNetwork cd, CardType ct, String acc){
        final String fixedCode = "683";

        String netCode = switch (cd){
            case VISA -> "4";
            case MASTERCARD -> "5";
            case null, default -> "6";
         };

        String typeCode = switch (ct){
            case DEBIT -> "01";
            case CREDIT -> "02";
            default -> "00";
         };

        String randomPart = acc.substring(3);

        String digits = netCode + fixedCode + typeCode + randomPart;
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
