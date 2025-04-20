import { Component, ViewChild } from '@angular/core';
import { Todo } from '../../models/todo.model';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { TodoFormComponent } from '../todo-form/todo-form.component';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [TodoListComponent, TodoFormComponent],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent {
  @ViewChild(TodoListComponent) todoListComponent!: TodoListComponent;

  onTodoAdded(todo: Todo): void {
    if (this.todoListComponent) {
      // 新しいタスクが追加されたら、TodoListコンポーネントのloadTodosメソッドを呼び出して再取得
      this.todoListComponent.loadTodos();
    }
  }
} 