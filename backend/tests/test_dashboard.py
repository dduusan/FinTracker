"""Testovi za dashboard modul — summary, monthly, by-category, recent."""

import pytest
from httpx import AsyncClient

from src.config.models import User, Category


async def _seed_transactions(client: AsyncClient, auth_headers: dict, categories: list[Category]):
    """Helper — kreira test transakcije za dashboard testove."""
    transactions = [
        {"amount": 85000, "type": "income", "category_id": categories[0].id, "date": "2026-02-05"},
        {"amount": 15000, "type": "income", "category_id": categories[0].id, "date": "2026-02-10"},
        {"amount": 4500, "type": "expense", "category_id": categories[1].id, "date": "2026-02-07"},
        {"amount": 3200, "type": "expense", "category_id": categories[1].id, "date": "2026-02-12"},
        {"amount": 2000, "type": "expense", "category_id": categories[2].id, "date": "2026-02-08"},
    ]
    for tx in transactions:
        await client.post("/api/transactions/", headers=auth_headers, json=tx)


class TestSummary:
    async def test_summary_empty(self, client: AsyncClient, auth_headers: dict):
        response = await client.get("/api/dashboard/summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_income"] == 0
        assert data["total_expense"] == 0
        assert data["balance"] == 0
        assert data["transaction_count"] == 0

    async def test_summary_with_data(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        await _seed_transactions(client, auth_headers, test_categories)

        response = await client.get("/api/dashboard/summary", headers=auth_headers)
        data = response.json()
        assert data["total_income"] == 100000
        assert data["total_expense"] == 9700
        assert data["balance"] == 90300
        assert data["transaction_count"] == 5

    async def test_summary_with_date_filter(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        await _seed_transactions(client, auth_headers, test_categories)

        response = await client.get(
            "/api/dashboard/summary?date_from=2026-02-10&date_to=2026-02-28",
            headers=auth_headers,
        )
        data = response.json()
        assert data["total_income"] == 15000
        assert data["total_expense"] == 3200
        assert data["transaction_count"] == 2

    async def test_summary_no_auth(self, client: AsyncClient):
        response = await client.get("/api/dashboard/summary")
        assert response.status_code == 403


class TestMonthly:
    async def test_monthly_trends(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        await _seed_transactions(client, auth_headers, test_categories)

        response = await client.get("/api/dashboard/monthly?months=6", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["months_count"] >= 1
        feb = [m for m in data["data"] if m["month"] == "2026-02"]
        assert len(feb) == 1
        assert feb[0]["income"] == 100000
        assert feb[0]["expense"] == 9700


class TestByCategory:
    async def test_by_category_expense(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        await _seed_transactions(client, auth_headers, test_categories)

        response = await client.get("/api/dashboard/by-category?type=expense", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["grand_total"] == 9700
        assert len(data["data"]) == 2  # Hrana + Transport
        # Sortiran po iznosu (najveci prvi)
        assert data["data"][0]["category_name"] == "Hrana"
        assert data["data"][0]["total"] == 7700

    async def test_by_category_income(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        await _seed_transactions(client, auth_headers, test_categories)

        response = await client.get("/api/dashboard/by-category?type=income", headers=auth_headers)
        data = response.json()
        assert data["grand_total"] == 100000
        assert len(data["data"]) == 1


class TestRecent:
    async def test_recent_transactions(self, client: AsyncClient, auth_headers: dict, test_categories: list[Category]):
        await _seed_transactions(client, auth_headers, test_categories)

        response = await client.get("/api/dashboard/recent?limit=3", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        # Najnovija prva (2026-02-12)
        assert data[0]["date"] == "2026-02-12"
        assert "category_name" in data[0]

    async def test_recent_empty(self, client: AsyncClient, auth_headers: dict):
        response = await client.get("/api/dashboard/recent", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []
