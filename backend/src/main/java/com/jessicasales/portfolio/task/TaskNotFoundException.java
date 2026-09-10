package com.jessicasales.portfolio.task;

/**
 * Thrown when a requested {@link Task} does not exist.
 */
public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(Long id) {
        super("Task not found with id " + id);
    }
}
