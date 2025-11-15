from typing import List, Optional
from src.models.todo import Todo
from src.repositories.todo_repository import TodoRepository
from src.schemas import TodoRequest


class TodoService:
    """Service layer for todo business logic."""

    def __init__(self, repository: TodoRepository):
        self.repository = repository

    def get_all_todos(self) -> List[Todo]:
        """Get all todos."""
        return self.repository.find_all()

    def get_todo_by_id(self, todo_id: int) -> Optional[Todo]:
        """Get a todo by ID."""
        return self.repository.find_by_id(todo_id)

    def create_todo(self, todo_request: TodoRequest) -> Todo:
        """Create a new todo."""
        todo = Todo(
            task=todo_request.task,
            completed=todo_request.completed if todo_request.completed is not None else False
        )
        return self.repository.save(todo)

    def update_todo(self, todo_id: int, todo_request: TodoRequest) -> Optional[Todo]:
        """Update an existing todo."""
        existing_todo = self.repository.find_by_id(todo_id)
        if existing_todo is None:
            return None

        existing_todo.task = todo_request.task
        existing_todo.completed = todo_request.completed if todo_request.completed is not None else False

        return self.repository.save(existing_todo)

    def delete_todo(self, todo_id: int) -> bool:
        """Delete a todo by ID."""
        todo = self.repository.find_by_id(todo_id)
        if todo is None:
            return False

        self.repository.delete(todo)
        return True
