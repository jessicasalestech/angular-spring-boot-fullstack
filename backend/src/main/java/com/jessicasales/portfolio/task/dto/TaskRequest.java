package com.jessicasales.portfolio.task.dto;

import com.jessicasales.portfolio.task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Payload accepted when creating or updating a task.
 *
 * <p>Validation lives here so invalid input is rejected before it reaches the
 * persistence layer and is reported back as a field-level error map.</p>
 */
public record TaskRequest(

        @NotBlank(message = "title is required")
        @Size(max = 120, message = "title must be at most 120 characters")
        String title,

        @Size(max = 1000, message = "description must be at most 1000 characters")
        String description,

        @NotNull(message = "status is required")
        TaskStatus status,

        LocalDate dueDate
) {
}
