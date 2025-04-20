import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.scss']
})
export class TodoFormComponent {
  @Output() todoAdded = new EventEmitter<Todo>();
  
  todoForm: FormGroup;
  error = '';
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private todoService: TodoService
  ) {
    this.todoForm = this.fb.group({
      task: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  onSubmit(): void {
    if (this.todoForm.invalid) {
      return;
    }

    this.submitting = true;
    const newTodo: Todo = {
      task: this.todoForm.value.task,
      completed: false
    };

    this.todoService.createTodo(newTodo).subscribe({
      next: (todo) => {
        this.todoAdded.emit(todo);
        this.todoForm.reset();
        this.submitting = false;
      },
      error: (error) => {
        this.error = 'タスクの作成に失敗しました';
        this.submitting = false;
        console.error('Error creating todo:', error);
      }
    });
  }

  get taskControl() {
    return this.todoForm.get('task');
  }
} 