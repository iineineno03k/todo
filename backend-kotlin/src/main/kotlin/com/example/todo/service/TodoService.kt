package com.example.todo.service

import com.example.todo.model.Todo
import com.example.todo.repository.TodoRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class TodoService(
    private val todoRepository: TodoRepository
) {
    fun getAllTodos(): List<Todo> = todoRepository.findAll()

    fun getTodoById(id: Long): Todo? = todoRepository.findById(id).orElse(null)

    fun createTodo(todo: Todo): Todo = todoRepository.save(todo)

    fun updateTodo(id: Long, todoDetails: Todo): Todo? {
        return todoRepository.findById(id)
            .map { existingTodo ->
                existingTodo.task = todoDetails.task
                existingTodo.completed = todoDetails.completed
                todoRepository.save(existingTodo)
            }
            .orElse(null)
    }

    fun deleteTodo(id: Long): Boolean {
        return todoRepository.findById(id)
            .map { todo ->
                todoRepository.delete(todo)
                true
            }
            .orElse(false)
    }
}
