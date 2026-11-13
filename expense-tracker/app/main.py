"""Expense Tracker API - a small FastAPI service used as the target for
GitLab Duo Agent Platform post-code automation (review, security, test repair,
deploy, summary)."""

from collections import defaultdict
from datetime import date
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Expense Tracker API", version="1.0.0")


class ExpenseIn(BaseModel):
    description: str = Field(min_length=1, max_length=200)
    amount: float = Field(gt=0)
    category: str = Field(min_length=1, max_length=50)
    spent_on: Optional[date] = None


class Expense(ExpenseIn):
    id: int


_expenses: dict[int, Expense] = {}
_next_id = 1


def reset_store() -> None:
    """Clear all data (used by tests)."""
    global _next_id
    _expenses.clear()
    _next_id = 1


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/expenses", response_model=Expense, status_code=201)
def create_expense(payload: ExpenseIn) -> Expense:
    global _next_id
    expense = Expense(id=_next_id, **payload.model_dump())
    if expense.spent_on is None:
        expense.spent_on = date.today()
    _expenses[expense.id] = expense
    _next_id += 1
    return expense


@app.get("/expenses", response_model=list[Expense])
def list_expenses(category: Optional[str] = None) -> list[Expense]:
    items = list(_expenses.values())
    if category:
        items = [e for e in items if e.category.lower() == category.lower()]
    return items


@app.get("/expenses/{expense_id}", response_model=Expense)
def get_expense(expense_id: int) -> Expense:
    expense = _expenses.get(expense_id)
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@app.delete("/expenses/{expense_id}", status_code=204)
def delete_expense(expense_id: int) -> None:
    if expense_id not in _expenses:
        raise HTTPException(status_code=404, detail="Expense not found")
    del _expenses[expense_id]


@app.get("/summary")
def summary() -> dict:
    totals: dict[str, float] = defaultdict(float)
    for e in _expenses.values():
        totals[e.category.lower()] += e.amount
    return {
        "count": len(_expenses),
        "total": round(sum(totals.values()), 2),
        "by_category": {k: round(v, 2) for k, v in sorted(totals.items())},
    }
