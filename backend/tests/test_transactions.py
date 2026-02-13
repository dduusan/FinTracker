"""Testovi za transactions modul — CRUD operacije."""

import pytest
from httpx import AsyncClient

from src.config.models import User, Category


class TestCreateTransaction:
    async def test_create_transaction(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        response = await client.post("/api/transactions/", headers=auth_headers, json={
            "amount": 5000,
            "type": "expense",
            "category_id": test_categories[1].id,  # Hrana
            "description": "Nedeljni market",
            "date": "2026-02-10",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 5000
        assert data["type"] == "expense"
        assert data["description"] == "Nedeljni market"

    async def test_create_transaction_no_auth(self, client: AsyncClient):
        response = await client.post("/api/transactions/", json={
            "amount": 1000,
            "type": "income",
            "category_id": 1,
            "date": "2026-02-10",
        })
        assert response.status_code == 403

    async def test_create_transaction_invalid_amount(self, client: AsyncClient, auth_headers: dict):
        response = await client.post("/api/transactions/", headers=auth_headers, json={
            "amount": -100,
            "type": "expense",
            "category_id": 1,
            "date": "2026-02-10",
        })
        assert response.status_code == 422


class TestListTransactions:
    async def test_list_empty(self, client: AsyncClient, auth_headers: dict):
        response = await client.get("/api/transactions/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["data"] == []

    async def test_list_with_data(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        # Kreiraj 2 transakcije
        await client.post("/api/transactions/", headers=auth_headers, json={
            "amount": 85000, "type": "income", "category_id": test_categories[0].id, "date": "2026-02-05",
        })
        await client.post("/api/transactions/", headers=auth_headers, json={
            "amount": 3000, "type": "expense", "category_id": test_categories[1].id, "date": "2026-02-07",
        })

        response = await client.get("/api/transactions/", headers=auth_headers)
        data = response.json()
        assert data["total"] == 2
        assert len(data["data"]) == 2

    async def test_list_filter_by_type(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        await client.post("/api/transactions/", headers=auth_headers, json={
            "amount": 85000, "type": "income", "category_id": test_categories[0].id, "date": "2026-02-05",
        })
        await client.post("/api/transactions/", headers=auth_headers, json={
            "amount": 3000, "type": "expense", "category_id": test_categories[1].id, "date": "2026-02-07",
        })

        response = await client.get("/api/transactions/?type=income", headers=auth_headers)
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["type"] == "income"


class TestGetTransaction:
    async def test_get_by_id(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        create = await client.post("/api/transactions/", headers=auth_headers, json={
            "amount": 5000, "type": "expense", "category_id": test_categories[1].id, "date": "2026-02-10",
        })
        tx_id = create.json()["id"]

        response = await client.get(f"/api/transactions/{tx_id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["id"] == tx_id

    async def test_get_nonexistent(self, client: AsyncClient, auth_headers: dict):
        response = await client.get(
            "/api/transactions/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestUpdateTransaction:
    async def test_update(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        create = await client.post("/api/transactions/", headers=auth_headers, json={
            "amount": 5000, "type": "expense", "category_id": test_categories[1].id, "date": "2026-02-10",
        })
        tx_id = create.json()["id"]

        response = await client.put(f"/api/transactions/{tx_id}", headers=auth_headers, json={
            "amount": 7500,
            "description": "Ažuriran iznos",
        })
        assert response.status_code == 200
        assert response.json()["amount"] == 7500
        assert response.json()["description"] == "Ažuriran iznos"


class TestDeleteTransaction:
    async def test_delete(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        create = await client.post("/api/transactions/", headers=auth_headers, json={
            "amount": 5000, "type": "expense", "category_id": test_categories[1].id, "date": "2026-02-10",
        })
        tx_id = create.json()["id"]

        response = await client.delete(f"/api/transactions/{tx_id}", headers=auth_headers)
        assert response.status_code == 204

        # Provera da je obrisano
        get_response = await client.get(f"/api/transactions/{tx_id}", headers=auth_headers)
        assert get_response.status_code == 404
