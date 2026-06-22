package com.elitetech_inc.ensarkbank.customer_management.card.dto.response;


import com.elitetech_inc.ensarkbank.enums.CardNetwork;
import com.elitetech_inc.ensarkbank.enums.CardStatus;
import com.elitetech_inc.ensarkbank.enums.CardType;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Date;

@Data
public class CardResponse {

    private String holderName;
    private String accountNumber;
    private LocalDateTime issueDate;
    private Boolean isMultipleCurrencyEnable;
    private String cardNumber;
    private String cvv;
    private CardNetwork cardNetwork;
    private CardType type;
    private CardStatus status;
    private Date expiryDate;
    private Double limit;

}
