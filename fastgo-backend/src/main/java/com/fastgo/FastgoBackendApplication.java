package com.fastgo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FastgoBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(FastgoBackendApplication.class, args);
	}

}
