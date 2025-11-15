from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.repositories.todo_repository import TodoRepository
from src.services.todo_service import TodoService
from src.schemas import TodoRequest, TodoResponse, ErrorResponse

router = APIRouter(
    prefix="/api/todos",
    tags=["todos"]
)


def get_todo_service(db: Session = Depends(get_db)) -> TodoService:
    """Dependency to get TodoService instance."""
    repository = TodoRepository(db)
    return TodoService(repository)


@router.get(
    "",
    response_model=List[TodoResponse],
    summary="Get all todos",
    description="Retrieve all todos from the database"
)
def get_all_todos(
    service: TodoService = Depends(get_todo_service)
) -> List[TodoResponse]:
    """Get all todos."""
    todos = service.get_all_todos()
    return [
        TodoResponse(
            id=todo.id,
            task=todo.task,
            completed=todo.completed,
            createdAt=todo.created_at
        )
        for todo in todos
    ]


@router.get(
    "/{id}",
    response_model=TodoResponse,
    summary="Get todo by ID",
    description="Retrieve a specific todo by its ID",
    responses={
        404: {"model": ErrorResponse, "description": "Todo not found"}
    }
)
def get_todo_by_id(
    id: int,
    service: TodoService = Depends(get_todo_service)
) -> TodoResponse:
    """Get a todo by ID."""
    todo = service.get_todo_by_id(id)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return TodoResponse(
        id=todo.id,
        task=todo.task,
        completed=todo.completed,
        createdAt=todo.created_at
    )


@router.post(
    "",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new todo",
    description="Create a new todo item",
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input"}
    }
)
def create_todo(
    todo_request: TodoRequest,
    service: TodoService = Depends(get_todo_service)
) -> TodoResponse:
    """Create a new todo."""
    todo = service.create_todo(todo_request)
    return TodoResponse(
        id=todo.id,
        task=todo.task,
        completed=todo.completed,
        createdAt=todo.created_at
    )


@router.put(
    "/{id}",
    response_model=TodoResponse,
    summary="Update a todo",
    description="Update an existing todo by its ID",
    responses={
        404: {"model": ErrorResponse, "description": "Todo not found"},
        400: {"model": ErrorResponse, "description": "Invalid input"}
    }
)
def update_todo(
    id: int,
    todo_request: TodoRequest,
    service: TodoService = Depends(get_todo_service)
) -> TodoResponse:
    """Update a todo."""
    updated_todo = service.update_todo(id, todo_request)
    if updated_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return TodoResponse(
        id=updated_todo.id,
        task=updated_todo.task,
        completed=updated_todo.completed,
        createdAt=updated_todo.created_at
    )


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a todo",
    description="Delete a todo by its ID",
    responses={
        404: {"model": ErrorResponse, "description": "Todo not found"}
    }
)
def delete_todo(
    id: int,
    service: TodoService = Depends(get_todo_service)
) -> None:
    """Delete a todo."""
    success = service.delete_todo(id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
