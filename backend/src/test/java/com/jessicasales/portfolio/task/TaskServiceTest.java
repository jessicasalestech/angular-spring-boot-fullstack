package com.jessicasales.portfolio.task;

import com.jessicasales.portfolio.task.dto.TaskRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link TaskService} with a mocked repository.
 */
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository repository;

    @InjectMocks
    private TaskService service;

    @Test
    @DisplayName("findAll delegates to the repository ordering query")
    void findAllDelegates() {
        when(repository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(new Task()));

        assertThat(service.findAll()).hasSize(1);
        verify(repository).findAllByOrderByCreatedAtDesc();
    }

    @Test
    @DisplayName("findById throws TaskNotFoundException for an unknown id")
    void findByIdThrowsWhenMissing() {
        when(repository.findById(123L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(123L))
                .isInstanceOf(TaskNotFoundException.class)
                .hasMessageContaining("123");
    }

    @Test
    @DisplayName("create trims the title and applies the default status")
    void createTrimsTitleAndDefaultsStatus() {
        when(repository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task saved = service.create(new TaskRequest("  Ship it  ", "desc", null, LocalDate.parse("2026-06-01")));

        assertThat(saved.getTitle()).isEqualTo("Ship it");
        assertThat(saved.getStatus()).isEqualTo(TaskStatus.TODO);
        assertThat(saved.getDueDate()).isEqualTo(LocalDate.parse("2026-06-01"));
    }

    @Test
    @DisplayName("update mutates every editable field of an existing task")
    void updateMutatesExistingTask() {
        Task existing = new Task("Old", "old desc", TaskStatus.TODO, null);
        existing.setId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task updated = service.update(1L, new TaskRequest("New", "new desc", TaskStatus.DONE, LocalDate.parse("2026-07-15")));

        assertThat(updated.getTitle()).isEqualTo("New");
        assertThat(updated.getDescription()).isEqualTo("new desc");
        assertThat(updated.getStatus()).isEqualTo(TaskStatus.DONE);
        assertThat(updated.getDueDate()).isEqualTo(LocalDate.parse("2026-07-15"));
    }

    @Test
    @DisplayName("delete removes an existing task")
    void deleteRemovesExistingTask() {
        Task existing = new Task("Doomed", null, TaskStatus.TODO, null);
        existing.setId(9L);
        when(repository.findById(9L)).thenReturn(Optional.of(existing));

        service.delete(9L);

        ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
        verify(repository).delete(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(9L);
    }

    @Test
    @DisplayName("delete aborts when the task does not exist")
    void deleteThrowsWhenMissing() {
        when(repository.findById(77L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(77L)).isInstanceOf(TaskNotFoundException.class);
        verify(repository, never()).delete(any(Task.class));
    }

    @Test
    @DisplayName("timestamps are populated by the JPA lifecycle callbacks")
    void lifecycleCallbacksFillTimestamps() {
        Task task = new Task("Timestamped", null, TaskStatus.TODO, null);
        task.onCreate();

        assertThat(task.getCreatedAt()).isNotNull();
        assertThat(task.getUpdatedAt()).isNotNull();

        task.onUpdate();

        assertThat(task.getUpdatedAt()).isNotNull();
    }
}
