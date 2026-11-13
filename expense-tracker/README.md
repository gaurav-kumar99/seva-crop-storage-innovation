# Expense Tracker API

A small FastAPI service built for the GitLab Transcend "Life After Code" Hackathon.
The app is intentionally simple: the focus is the GitLab Duo Agent Platform
automation around it (code review, security remediation, test repair, staging
deploy, and a summary posted back to the issue, with a human approving production).

## Run locally

```bash
pip install -r requirements-dev.txt
pytest -q
uvicorn app.main:app --reload --port 8080
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| POST | `/expenses` | Create an expense |
| GET | `/expenses` | List expenses (optional `?category=`) |
| GET | `/expenses/{id}` | Get one expense |
| DELETE | `/expenses/{id}` | Delete an expense |
| GET | `/summary` | Totals overall and by category |

## License

MIT, see `LICENSE`.
