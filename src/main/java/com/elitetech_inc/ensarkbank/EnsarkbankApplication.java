package com.elitetech_inc.ensarkbank;

import com.elitetech_inc.ensarkbank.util.CardGenerator;
import com.elitetech_inc.ensarkbank.util.Utils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EnsarkbankApplication {

	public static void main(String[] args) {
		SpringApplication.run(EnsarkbankApplication.class, args);
		CardGenerator generator = new CardGenerator();


	}

}
