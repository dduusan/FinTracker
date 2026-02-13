"""Testovi za budgets modul — CRUD + summary."""

import pytest
from httpx import AsyncClient

from src.config.models import User, Category


class TestCreateBudget:
    async def test_create_budget(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        response = await client.post("/api/budgets/", headers=auth_headers, json={
            "category_id": test_categories[1].id,  # Hrana
            "amount": 20000,
            "month": "2026-02-01",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 20000
        assert data["month"] == "2026-02-01"

    async def test_create_duplicate_budget(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        await client.post("/api/budgets/", headers=auth_headers, json={
            "category_id": test_categories[1].id,
            "amount": 20000,
            "month": "2026-02-01",
        })
        # Isti mesec + kategorija
        response = await client.post("/api/budgets/", headers=auth_headers, json={
            "category_id": test_categories[1].id,
            "amount": 25000,
            "month": "2026-02-01",
        })
        assert response.status_code == 400
        assert "vec postoji" in response.json()["error"].lower()

    async def test_create_budget_invalid_category(self, client: AsyncClient, auth_headers: dict):
        response = await client.post("/api/budgets/", headers=auth_headers, json={
            "category_id": 9999,
            "amount": 10000,
            "month": "2026-02-01",
        })
        assert response.status_code == 404


class TestListBudgets:
    async def test_list_budgets(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        await client.post("/api/budgets/", headers=auth_headers, json={
            "category_id": test_categories[1].id, "amount": 20000, "month": "2026-02-01",
        })
        await client.post("/api/budgets/", headers=auth_headers, json={
            "category_id": test_categories[2].id, "amount": 5000, "month": "2026-02-01",
        })

        response = await client.get("/api/budgets/", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()) == 2

    async def test_list_filter_by_month(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        await client.post("/api/budgets/", headers=auth_headers, json={
            "category_id": test_categories[1].id, "amount": 20000, "month": "2026-02-01",
        })
        await client.post("/api/budgets/", headers=auth_headers, json={
            "category_id": test_categories[1].id, "amount": 22000, "month": "2026-03-01",
        })

        response = await client.get("/api/budgets/?month=2026-02-01", headers=auth_headers)
        data = response.json()
        assert len(data) == 1
        assert data[0]["month"] == "2026-02-01"


class TestBudgetSummary:
    async def test_summary_with_spending(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        # Kreiraj budget
        await client.post("/api/budgets/", headers=auth_headers, json={
            "category_id": test_categories[1].id, "amount": 20000, "month": "2026-02-01",
        })
        # Kreiraj transakciju u toj kategoriji
        await client.post("/api/transactions/", headers=auth_headers, json={
            "amount": 5000, "type": "expense", "category_id": test_categories[1].id, "date": "2026-02-10",
        })

        response = await client.get("/api/budgets/summary?month=2026-02-01", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["budgeted"] == 20000
        assert data[0]["spent"] == 5000
        assert data[0]["remaining"] == 15000
        assert data[0]["category_name"] == "Hrana"

    async def test_summary_empty_month(self, client: AsyncClient, auth_headers: dict):
        response = await client.get("/api/budgets/summary?month=2025-01-01", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []


class TestUpdateBudget:
    async def test_update(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        create = await client.post("/api/budgets/", headers=auth_headers, json={
            "category_id": test_categories[1].id, "amount": 20000, "month": "2026-02-01",
        })
        budget_id = create.json()["id"]

        response = await client.put(f"/api/budgets/{budget_id}", headers=auth_headers, json={
            "amount": 25000,
        })
        assert response.status_code == 200
        assert response.json()["amount"] == 25000


class TestDeleteBudget:
    async def test_delete(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        create = await client.post("/api/budgets/", headers=auth_headers, json={
            "category_id": test_categories[1].id, "amount": 20000, "month": "2026-02-01",
        })
        budget_id = create.json()["id"]

        response = await client.delete(f"/api/budgets/{budget_id}", headers=auth_headers)
        assert response.status_code == 204

        get_response = await client.get(f"/api/budgets/{budget_id}", headers=auth_headers)
        assert get_response.status_code == 404
