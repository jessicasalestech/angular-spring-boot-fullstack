package com.jessicasales.portfolio.task;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jessicasales.portfolio.task.dto.TaskRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MockMvc slice tests for the task REST endpoints.
 *
 * <p>Covers the happy path for every CRUD verb, bean-validation failures on the
 * request payload and the 404 produced when a task id does not exist.</p>
 */
@WebMvcTest(TaskController.class)
@ImportAutoConfiguration(ValidationAutoConfiguration.class)
@Import(com.jessicasales.portfolio.web.GlobalExceptionHandler.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TaskService taskService;

    private Task task(Long id) {
        Task task = new Task("Write the API", "Expose CRUD endpoints", TaskStatus.TODO, LocalDate.parse("2026-01-31"));
        task.setId(id);
        return task;
    }

    @Test
    @DisplayName("GET /api/tasks returns every task")
    void findAllReturnsTasks() throws Exception {
        when(taskService.findAll()).thenReturn(List.of(task(1L), task(2L)));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Write the API"))
                .andExpect(jsonPath("$[0].status").value("TODO"));
    }

    @Test
    @DisplayName("GET /api/tasks/{id} returns a single task")
    void findByIdReturnsTask() throws Exception {
        when(taskService.findById(42L)).thenReturn(task(42L));

        mockMvc.perform(get("/api/tasks/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.description").value("Expose CRUD endpoints"));
    }

    @Test
    @DisplayName("GET /api/tasks/{id} returns 404 when the task is missing")
    void findByIdReturnsNotFound() throws Exception {
        when(taskService.findById(anyLong())).thenThrow(new TaskNotFoundException(99L));

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Task not found"))
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("POST /api/tasks creates a task and returns 201 + Location")
    void createReturnsCreated() throws Exception {
        when(taskService.create(any(TaskRequest.class))).thenReturn(task(7L));
        TaskRequest request = new TaskRequest("Write the API", "Expose CRUD endpoints", TaskStatus.TODO, LocalDate.parse("2026-01-31"));

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/tasks/7"))
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.title").value("Write the API"));

        verify(taskService).create(any(TaskRequest.class));
    }

    @Test
    @DisplayName("POST /api/tasks rejects a blank title with 400 and a field error")
    void createRejectsBlankTitle() throws Exception {
        TaskRequest invalid = new TaskRequest("   ", "no title", TaskStatus.TODO, null);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.errors.title").value("title is required"));
    }

    @Test
    @DisplayName("POST /api/tasks rejects a missing status with 400")
    void createRejectsMissingStatus() throws Exception {
        TaskRequest invalid = new TaskRequest("Valid title", null, null, null);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.status").value("status is required"));
    }

    @Test
    @DisplayName("POST /api/tasks rejects a title longer than 120 characters")
    void createRejectsTooLongTitle() throws Exception {
        TaskRequest invalid = new TaskRequest("x".repeat(121), null, TaskStatus.TODO, null);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").value("title must be at most 120 characters"));
    }

    @Test
    @DisplayName("PUT /api/tasks/{id} updates an existing task")
    void updateReturnsUpdatedTask() throws Exception {
        Task updated = task(3L);
        updated.setTitle("Renamed");
        updated.setStatus(TaskStatus.DONE);
        when(taskService.update(eq(3L), any(TaskRequest.class))).thenReturn(updated);

        TaskRequest request = new TaskRequest("Renamed", null, TaskStatus.DONE, null);

        mockMvc.perform(put("/api/tasks/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Renamed"))
                .andExpect(jsonPath("$.status").value("DONE"));
    }

    @Test
    @DisplayName("PUT /api/tasks/{id} returns 404 when the task is missing")
    void updateReturnsNotFound() throws Exception {
        when(taskService.update(eq(404L), any(TaskRequest.class))).thenThrow(new TaskNotFoundException(404L));

        TaskRequest request = new TaskRequest("Renamed", null, TaskStatus.DONE, null);

        mockMvc.perform(put("/api/tasks/404")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} returns 204")
    void deleteReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/tasks/5"))
                .andExpect(status().isNoContent());

        verify(taskService).delete(5L);
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} returns 404 when the task is missing")
    void deleteReturnsNotFound() throws Exception {
        doThrow(new TaskNotFoundException(5L)).when(taskService).delete(5L);

        mockMvc.perform(delete("/api/tasks/5"))
                .andExpect(status().isNotFound());
    }

}
