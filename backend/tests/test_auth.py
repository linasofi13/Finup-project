from fastapi.testclient import TestClient
from app.main import app


def test_login_successful(client):
    response = client.post(
        "/auth/login", json={"email": "juan@mail.com", "password": "stringst"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_invalid_credentials(client):
    response = client.post(
        "/auth/login", json={"email": "wrong@mail.com", "password": "wrongpass"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciales inválidas"
