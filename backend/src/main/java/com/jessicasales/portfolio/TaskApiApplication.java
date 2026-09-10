package com.jessicasales.portfolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the Task REST API.
 *
 * <p>Exposes a CRUD API for {@code Task} resources consumed by the Angular front end.</p>
 */
@SpringBootApplication
public class TaskApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskApiApplication.class, args);
    }
}
