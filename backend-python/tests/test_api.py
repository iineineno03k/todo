import pytest
from fastapi.testclient import TestClient


class TestTodoAPI:
    """Tests for Todo API endpoints."""

    def test_health_check(self, client: TestClient):
        """Test health check endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_get_all_todos_empty(self, client: TestClient):
        """Test getting all todos when database is empty."""
        response = client.get("/api/todos")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_todo(self, client: TestClient):
        """Test creating a new todo."""
        todo_data = {
            "task": "Test task",
            "completed": False
        }
        response = client.post("/api/todos", json=todo_data)
        assert response.status_code == 201
        data = response.json()
        assert data["task"] == "Test task"
        assert data["completed"] is False
        assert "id" in data
        assert "createdAt" in data

    def test_create_todo_without_completed(self, client: TestClient):
        """Test creating a todo without completed field (should default to False)."""
        todo_data = {
            "task": "Test task"
        }
        response = client.post("/api/todos", json=todo_data)
        assert response.status_code == 201
        data = response.json()
        assert data["completed"] is False

    def test_create_todo_invalid_empty_task(self, client: TestClient):
        """Test creating a todo with empty task."""
        todo_data = {
            "task": "",
            "completed": False
        }
        response = client.post("/api/todos", json=todo_data)
        assert response.status_code == 422  # Validation error

    def test_create_todo_missing_task(self, client: TestClient):
        """Test creating a todo without task field."""
        todo_data = {
            "completed": False
        }
        response = client.post("/api/todos", json=todo_data)
        assert response.status_code == 422  # Validation error

    def test_get_todo_by_id(self, client: TestClient):
        """Test getting a todo by ID."""
        # Create a todo first
        todo_data = {"task": "Test task", "completed": False}
        create_response = client.post("/api/todos", json=todo_data)
        created_todo = create_response.json()

        # Get the todo
        response = client.get(f"/api/todos/{created_todo['id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == created_todo["id"]
        assert data["task"] == "Test task"

    def test_get_todo_by_id_not_found(self, client: TestClient):
        """Test getting a non-existing todo."""
        response = client.get("/api/todos/999")
        assert response.status_code == 404

    def test_update_todo(self, client: TestClient):
        """Test updating a todo."""
        # Create a todo first
        todo_data = {"task": "Original task", "completed": False}
        create_response = client.post("/api/todos", json=todo_data)
        created_todo = create_response.json()

        # Update the todo
        update_data = {"task": "Updated task", "completed": True}
        response = client.put(f"/api/todos/{created_todo['id']}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == created_todo["id"]
        assert data["task"] == "Updated task"
        assert data["completed"] is True

    def test_update_todo_not_found(self, client: TestClient):
        """Test updating a non-existing todo."""
        update_data = {"task": "Updated task", "completed": True}
        response = client.put("/api/todos/999", json=update_data)
        assert response.status_code == 404

    def test_update_todo_invalid_empty_task(self, client: TestClient):
        """Test updating a todo with empty task."""
        # Create a todo first
        todo_data = {"task": "Original task", "completed": False}
        create_response = client.post("/api/todos", json=todo_data)
        created_todo = create_response.json()

        # Try to update with empty task
        update_data = {"task": "", "completed": True}
        response = client.put(f"/api/todos/{created_todo['id']}", json=update_data)
        assert response.status_code == 422  # Validation error

    def test_delete_todo(self, client: TestClient):
        """Test deleting a todo."""
        # Create a todo first
        todo_data = {"task": "Test task", "completed": False}
        create_response = client.post("/api/todos", json=todo_data)
        created_todo = create_response.json()

        # Delete the todo
        response = client.delete(f"/api/todos/{created_todo['id']}")
        assert response.status_code == 204

        # Verify it's deleted
        get_response = client.get(f"/api/todos/{created_todo['id']}")
        assert get_response.status_code == 404

    def test_delete_todo_not_found(self, client: TestClient):
        """Test deleting a non-existing todo."""
        response = client.delete("/api/todos/999")
        assert response.status_code == 404

    def test_get_all_todos_multiple(self, client: TestClient):
        """Test getting all todos when multiple exist."""
        # Create multiple todos
        client.post("/api/todos", json={"task": "Task 1", "completed": False})
        client.post("/api/todos", json={"task": "Task 2", "completed": True})
        client.post("/api/todos", json={"task": "Task 3", "completed": False})

        # Get all todos
        response = client.get("/api/todos")
        assert response.status_code == 200
        todos = response.json()
        assert len(todos) == 3
        assert todos[0]["task"] == "Task 1"
        assert todos[1]["task"] == "Task 2"
        assert todos[2]["task"] == "Task 3"

    def test_complete_workflow(self, client: TestClient):
        """Test complete workflow: create, read, update, delete."""
        # Create
        create_response = client.post(
            "/api/todos",
            json={"task": "Complete workflow task", "completed": False}
        )
        assert create_response.status_code == 201
        todo = create_response.json()
        todo_id = todo["id"]

        # Read
        get_response = client.get(f"/api/todos/{todo_id}")
        assert get_response.status_code == 200
        assert get_response.json()["task"] == "Complete workflow task"

        # Update
        update_response = client.put(
            f"/api/todos/{todo_id}",
            json={"task": "Updated workflow task", "completed": True}
        )
        assert update_response.status_code == 200
        assert update_response.json()["task"] == "Updated workflow task"
        assert update_response.json()["completed"] is True

        # Delete
        delete_response = client.delete(f"/api/todos/{todo_id}")
        assert delete_response.status_code == 204

        # Verify deletion
        verify_response = client.get(f"/api/todos/{todo_id}")
        assert verify_response.status_code == 404
