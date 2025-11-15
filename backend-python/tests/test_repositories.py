import pytest
from sqlalchemy.orm import Session

from src.models.todo import Todo
from src.repositories.todo_repository import TodoRepository


class TestTodoRepository:
    """Tests for TodoRepository."""

    def test_find_all_empty(self, db_session: Session):
        """Test finding all todos when database is empty."""
        repository = TodoRepository(db_session)
        todos = repository.find_all()
        assert todos == []

    def test_save_and_find_all(self, db_session: Session):
        """Test saving a todo and finding all todos."""
        repository = TodoRepository(db_session)

        todo = Todo(task="Test task", completed=False)
        saved_todo = repository.save(todo)

        assert saved_todo.id is not None
        assert saved_todo.task == "Test task"
        assert saved_todo.completed is False

        todos = repository.find_all()
        assert len(todos) == 1
        assert todos[0].task == "Test task"

    def test_find_by_id_existing(self, db_session: Session):
        """Test finding a todo by existing ID."""
        repository = TodoRepository(db_session)

        todo = Todo(task="Test task", completed=False)
        saved_todo = repository.save(todo)

        found_todo = repository.find_by_id(saved_todo.id)
        assert found_todo is not None
        assert found_todo.id == saved_todo.id
        assert found_todo.task == "Test task"

    def test_find_by_id_non_existing(self, db_session: Session):
        """Test finding a todo by non-existing ID."""
        repository = TodoRepository(db_session)
        found_todo = repository.find_by_id(999)
        assert found_todo is None

    def test_update_todo(self, db_session: Session):
        """Test updating a todo."""
        repository = TodoRepository(db_session)

        todo = Todo(task="Original task", completed=False)
        saved_todo = repository.save(todo)

        saved_todo.task = "Updated task"
        saved_todo.completed = True
        updated_todo = repository.save(saved_todo)

        assert updated_todo.id == saved_todo.id
        assert updated_todo.task == "Updated task"
        assert updated_todo.completed is True

    def test_delete_todo(self, db_session: Session):
        """Test deleting a todo."""
        repository = TodoRepository(db_session)

        todo = Todo(task="Test task", completed=False)
        saved_todo = repository.save(todo)

        repository.delete(saved_todo)

        found_todo = repository.find_by_id(saved_todo.id)
        assert found_todo is None

    def test_save_multiple_todos(self, db_session: Session):
        """Test saving multiple todos."""
        repository = TodoRepository(db_session)

        todo1 = Todo(task="Task 1", completed=False)
        todo2 = Todo(task="Task 2", completed=True)
        todo3 = Todo(task="Task 3", completed=False)

        repository.save(todo1)
        repository.save(todo2)
        repository.save(todo3)

        todos = repository.find_all()
        assert len(todos) == 3
        assert todos[0].task == "Task 1"
        assert todos[1].task == "Task 2"
        assert todos[2].task == "Task 3"
