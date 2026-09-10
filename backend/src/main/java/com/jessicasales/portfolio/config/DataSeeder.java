package com.jessicasales.portfolio.config;

import com.jessicasales.portfolio.task.Task;
import com.jessicasales.portfolio.task.TaskRepository;
import com.jessicasales.portfolio.task.TaskStatus;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeds a few example tasks on startup so the UI has something to render.
 * Disabled in tests and can be switched off with {@code app.seed-data=false}.
 */
@Configuration
@ConditionalOnProperty(name = "app.seed-data", havingValue = "true")
public class DataSeeder {

    @Bean
    ApplicationRunner seedTasks(TaskRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                return;
            }
            repository.saveAll(List.of(
                    new Task("Set up the Spring Boot API", "Expose CRUD endpoints for tasks.", TaskStatus.DONE, LocalDate.now().minusDays(5)),
                    new Task("Build the Angular task list", "Consume the REST API with HttpClient.", TaskStatus.IN_PROGRESS, LocalDate.now().plusDays(2)),
                    new Task("Add end-to-end tests", "Cover the create-task flow in the browser.", TaskStatus.TODO, LocalDate.now().plusDays(7))
            ));
        };
    }
}
