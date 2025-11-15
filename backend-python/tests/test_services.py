import pytest
from sqlalchemy.orm import Session

from src.models.todo import Todo
from src.repositories.todo_repository import TodoRepository
from src.services.todo_service import TodoService
from src.schemas import TodoRequest


class TestTodoService:
    """Tests for TodoService."""

    def test_get_all_todos_empty(self, db_session: Session):
        """Test getting all todos when database is empty."""
        repository = TodoRepository(db_session)
        service = TodoService(repository)

        todos = service.get_all_todos()
        assert todos == []

    def test_create_todo(self, db_session: Session):
        """Test creating a todo."""
        repository = TodoRepository(db_session)
        service = TodoService(repository)

        todo_request = TodoRequest(task="New task", completed=False)
        created_todo = service.create_todo(todo_request)

        assert created_todo.id is not None
        assert created_todo.task == "New task"
        assert created_todo.completed is False
        assert created_todo.created_at is not None

    def test_create_todo_with_default_completed(self, db_session: Session):
        """Test creating a todo with default completed status."""
        repository = TodoRepository(db_session)
        service = TodoService(repository)

        todo_request = TodoRequest(task="New task")
        created_todo = service.create_todo(todo_request)

        assert created_todo.completed is False

    def test_get_todo_by_id_existing(self, db_session: Session):
        """Test getting a todo by existing ID."""
        repository = TodoRepository(db_session)
        service = TodoService(repository)

        todo_request = TodoRequest(task="Test task", completed=False)
        created_todo = service.create_todo(todo_request)

        found_todo = service.get_todo_by_id(created_todo.id)
        assert found_todo is not None
        assert found_todo.id == created_todo.id
        assert found_todo.task == "Test task"

    def test_get_todo_by_id_non_existing(self, db_session: Session):
        """Test getting a todo by non-existing ID."""
        repository = TodoRepository(db_session)
        service = TodoService(repository)

        found_todo = service.get_todo_by_id(999)
        assert found_todo is None

    def test_update_todo_existing(self, db_session: Session):
        """Test updating an existing todo."""
        repository = TodoRepository(db_session)
        service = TodoService(repository)

        todo_request = TodoRequest(task="Original task", completed=False)
        created_todo = service.create_todo(todo_request)

        update_request = TodoRequest(task="Updated task", completed=True)
        updated_todo = service.update_todo(created_todo.id, update_request)

        assert updated_todo is not None
        assert updated_todo.id == created_todo.id
        assert updated_todo.task == "Updated task"
        assert updated_todo.completed is True

    def test_update_todo_non_existing(self, db_session: Session):
        """Test updating a non-existing todo."""
        repository = TodoRepository(db_session)
        service = TodoService(repository)

        update_request = TodoRequest(task="Updated task", completed=True)
        updated_todo = service.update_todo(999, update_request)

        assert updated_todo is None

    def test_delete_todo_existing(self, db_session: Session):
        """Test deleting an existing todo."""
        repository = TodoRepository(db_session)
        service = TodoService(repository)

        todo_request = TodoRequest(task="Test task", completed=False)
        created_todo = service.create_todo(todo_request)

        result = service.delete_todo(created_todo.id)
        assert result is True

        found_todo = service.get_todo_by_id(created_todo.id)
        assert found_todo is None

    def test_delete_todo_non_existing(self, db_session: Session):
        """Test deleting a non-existing todo."""
        repository = TodoRepository(db_session)
        service = TodoService(repository)

        result = service.delete_todo(999)
        assert result is False

    def test_get_all_todos_multiple(self, db_session: Session):
        """Test getting all todos when multiple exist."""
        repository = TodoRepository(db_session)
        service = TodoService(repository)

        service.create_todo(TodoRequest(task="Task 1", completed=False))
        service.create_todo(TodoRequest(task="Task 2", completed=True))
        service.create_todo(TodoRequest(task="Task 3", completed=False))

        todos = service.get_all_todos()
        assert len(todos) == 3
        assert todos[0].task == "Task 1"
        assert todos[1].task == "Task 2"
        assert todos[2].task == "Task 3"
