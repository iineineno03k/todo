from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Todo(Base):
    """Todo model representing a task in the database."""

    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task = Column(String, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Todo(id={self.id}, task='{self.task}', completed={self.completed})>"
