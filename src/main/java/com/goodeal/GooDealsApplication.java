package com.goodeal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class GooDealsApplication {

    public static void main(String[] args) {
        SpringApplication.run(GooDealsApplication.class, args);
    }
}
