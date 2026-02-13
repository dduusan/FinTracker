"""Testovi za categories modul — CRUD operacije."""

import pytest
from httpx import AsyncClient

from src.config.models import User, Category


class TestCreateCategory:
    async def test_create_category(self, client: AsyncClient, auth_headers: dict):
        response = await client.post("/api/categories/", headers=auth_headers, json={
            "name": "Investicije",
            "type": "income",
            "icon": "📈",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Investicije"
        assert data["type"] == "income"
        assert data["icon"] == "📈"

    async def test_create_duplicate(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        response = await client.post("/api/categories/", headers=auth_headers, json={
            "name": "Hrana",
            "type": "expense",
        })
        assert response.status_code == 400
        assert "vec postoji" in response.json()["error"].lower()

    async def test_create_no_auth(self, client: AsyncClient):
        response = await client.post("/api/categories/", json={
            "name": "Test",
            "type": "income",
        })
        assert response.status_code == 403


class TestListCategories:
    async def test_list_all(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        response = await client.get("/api/categories/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    async def test_list_filter_by_type(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        response = await client.get("/api/categories/?type=expense", headers=auth_headers)
        data = response.json()
        assert len(data) == 2
        assert all(c["type"] == "expense" for c in data)

    async def test_list_empty(self, client: AsyncClient, auth_headers: dict):
        response = await client.get("/api/categories/", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []


class TestGetCategory:
    async def test_get_by_id(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        cat_id = test_categories[0].id
        response = await client.get(f"/api/categories/{cat_id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["name"] == "Plata"

    async def test_get_nonexistent(self, client: AsyncClient, auth_headers: dict):
        response = await client.get("/api/categories/9999", headers=auth_headers)
        assert response.status_code == 404


class TestUpdateCategory:
    async def test_update(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        cat_id = test_categories[0].id
        response = await client.put(f"/api/categories/{cat_id}", headers=auth_headers, json={
            "name": "Plata (redovna)",
            "icon": "💵",
        })
        assert response.status_code == 200
        assert response.json()["name"] == "Plata (redovna)"
        assert response.json()["icon"] == "💵"


class TestDeleteCategory:
    async def test_delete(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        cat_id = test_categories[0].id
        response = await client.delete(f"/api/categories/{cat_id}", headers=auth_headers)
        assert response.status_code == 204

        get_response = await client.get(f"/api/categories/{cat_id}", headers=auth_headers)
        assert get_response.status_code == 404
