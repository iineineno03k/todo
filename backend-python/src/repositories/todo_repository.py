from typing import List, Optional
from sqlalchemy.orm import Session
from src.models.todo import Todo


class TodoRepository:
    """Repository for Todo database operations."""

    def __init__(self, db: Session):
        self.db = db

    def find_all(self) -> List[Todo]:
        """Get all todos."""
        return self.db.query(Todo).all()

    def find_by_id(self, todo_id: int) -> Optional[Todo]:
        """Get a todo by ID."""
        return self.db.query(Todo).filter(Todo.id == todo_id).first()

    def save(self, todo: Todo) -> Todo:
        """Save a todo (create or update)."""
        self.db.add(todo)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def delete(self, todo: Todo) -> None:
        """Delete a todo."""
        self.db.delete(todo)
        self.db.commit()
