from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class TodoRequest(BaseModel):
    """Schema for creating or updating a todo."""

    task: str = Field(..., min_length=1, description="The task description")
    completed: Optional[bool] = Field(default=False, description="Whether the task is completed")


class TodoResponse(BaseModel):
    """Schema for todo response."""

    id: int = Field(..., description="Unique identifier")
    task: str = Field(..., description="The task description")
    completed: bool = Field(..., description="Whether the task is completed")
    created_at: datetime = Field(..., alias="createdAt", description="Creation timestamp")

    class Config:
        from_attributes = True
        populate_by_name = True


class ErrorResponse(BaseModel):
    """Schema for error response."""

    message: str = Field(..., description="Error message")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")
