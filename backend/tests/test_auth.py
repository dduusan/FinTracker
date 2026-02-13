"""Testovi za auth modul — registracija, login, refresh, me."""

import pytest
from httpx import AsyncClient

from src.config.models import User


class TestRegister:
    async def test_register_success(self, client: AsyncClient):
        response = await client.post("/api/auth/register", json={
            "email": "novi@test.com",
            "password": "sifra123",
            "name": "Novi User",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "novi@test.com"
        assert data["name"] == "Novi User"
        assert "id" in data

    async def test_register_duplicate_email(self, client: AsyncClient, test_user: User):
        response = await client.post("/api/auth/register", json={
            "email": "test@test.com",
            "password": "sifra123",
        })
        assert response.status_code == 400
        assert "already registered" in response.json()["error"].lower()

    async def test_register_invalid_email(self, client: AsyncClient):
        response = await client.post("/api/auth/register", json={
            "email": "x",
            "password": "sifra123",
        })
        assert response.status_code == 422

    async def test_register_short_password(self, client: AsyncClient):
        response = await client.post("/api/auth/register", json={
            "email": "valid@test.com",
            "password": "12",
        })
        assert response.status_code == 422


class TestLogin:
    async def test_login_success(self, client: AsyncClient, test_user: User):
        response = await client.post("/api/auth/login", json={
            "email": "test@test.com",
            "password": "test123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client: AsyncClient, test_user: User):
        response = await client.post("/api/auth/login", json={
            "email": "test@test.com",
            "password": "pogresna",
        })
        assert response.status_code == 401

    async def test_login_nonexistent_user(self, client: AsyncClient):
        response = await client.post("/api/auth/login", json={
            "email": "nepostoji@test.com",
            "password": "test123",
        })
        assert response.status_code == 401


class TestRefresh:
    async def test_refresh_token(self, client: AsyncClient, test_user: User):
        # Login da dobijemo refresh token
        login = await client.post("/api/auth/login", json={
            "email": "test@test.com",
            "password": "test123",
        })
        refresh_token = login.json()["refresh_token"]

        response = await client.post(f"/api/auth/refresh?refresh_token={refresh_token}")
        assert response.status_code == 200
        assert "access_token" in response.json()

    async def test_refresh_with_invalid_token(self, client: AsyncClient):
        response = await client.post("/api/auth/refresh?refresh_token=invalid-token")
        assert response.status_code == 401


class TestMe:
    async def test_me_authenticated(self, client: AsyncClient, test_user: User, auth_headers: dict):
        response = await client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@test.com"
        assert data["name"] == "Test User"

    async def test_me_no_token(self, client: AsyncClient):
        response = await client.get("/api/auth/me")
        assert response.status_code == 403
