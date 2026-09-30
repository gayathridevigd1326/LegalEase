import pytest


def test_register_success(client):
    res = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@legalease.app",
            "password": "strongPassword123",
            "full_name": "Jordan Peterson"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "newuser@legalease.app"


def test_register_duplicate_email(client, test_user):
    res = client.post(
        "/api/auth/register",
        json={
            "email": test_user.email,
            "password": "anotherPassword",
            "full_name": "Duplicate User"
        }
    )
    assert res.status_code == 400
    data = res.json()
    assert data["success"] is False
    assert "already exists" in data["error"]["message"].lower()


def test_login_success(client, test_user):
    res = client.post(
        "/api/auth/login",
        json={
            "email": test_user.email,
            "password": "testpassword123"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "access_token" in data["data"]


def test_login_wrong_password(client, test_user):
    res = client.post(
        "/api/auth/login",
        json={
            "email": test_user.email,
            "password": "wrongpassword"
        }
    )
    assert res.status_code == 401
    data = res.json()
    assert data["success"] is False


def test_get_me(client, auth_headers):
    res = client.get("/api/auth/me", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["full_name"] == "Sarah Connor"
