package com.example.todo.controller

import com.example.todo.api.TodosApi
import com.example.todo.api.model.Todo as ApiTodo
import com.example.todo.api.model.TodoRequest
import com.example.todo.model.Todo
import com.example.todo.service.TodoService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.RestController
import java.time.ZoneOffset

@RestController
@CrossOrigin(origins = ["http://localhost:4200", "http://localhost:3000", "http://localhost:8080"])
class TodoController(
    private val todoService: TodoService
) : TodosApi {

    override fun getAllTodos(): ResponseEntity<List<ApiTodo>> {
        val todos = todoService.getAllTodos().map { it.toApiModel() }
        return ResponseEntity.ok(todos)
    }

    override fun getTodoById(id: Long): ResponseEntity<ApiTodo> {
        val todo = todoService.getTodoById(id)
        return todo?.let { ResponseEntity.ok(it.toApiModel()) }
            ?: ResponseEntity.notFound().build()
    }

    override fun createTodo(todoRequest: TodoRequest): ResponseEntity<ApiTodo> {
        val todo = Todo(
            task = todoRequest.task,
            completed = todoRequest.completed ?: false
        )
        val createdTodo = todoService.createTodo(todo)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTodo.toApiModel())
    }

    override fun updateTodo(id: Long, todoRequest: TodoRequest): ResponseEntity<ApiTodo> {
        val todoDetails = Todo(
            task = todoRequest.task,
            completed = todoRequest.completed ?: false
        )
        val updatedTodo = todoService.updateTodo(id, todoDetails)
        return updatedTodo?.let { ResponseEntity.ok(it.toApiModel()) }
            ?: ResponseEntity.notFound().build()
    }

    override fun deleteTodo(id: Long): ResponseEntity<Unit> {
        return if (todoService.deleteTodo(id)) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    private fun Todo.toApiModel(): ApiTodo {
        return ApiTodo(
            id = this.id!!,
            task = this.task,
            completed = this.completed,
            createdAt = this.createdAt.atOffset(ZoneOffset.UTC)
        )
    }
}
