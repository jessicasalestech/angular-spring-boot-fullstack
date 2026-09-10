package com.jessicasales.portfolio.task.dto;

import com.jessicasales.portfolio.task.Task;
import com.jessicasales.portfolio.task.TaskStatus;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Read model returned by the API.
 */
public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        LocalDate dueDate,
        Instant createdAt,
        Instant updatedAt
) {

    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
