# REMA Backend

> FastAPI backend for the REMA (Real Estate Market Assistant) platform.

## Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure (old fix later)

```
backend/
├── app/
│   ├── main.py           # FastAPI application entry point
│   ├── config.py         # Environment configuration
│   ├── database.py       # Database connection and session
│   ├── models/           # SQLAlchemy ORM models
│   ├── schemas/          # Pydantic validation schemas
│   ├── routers/          # API route handlers
│   ├── services/         # Business logic layer
│   ├── llm/              # LLM integration (Ollama)
│   └── ml/               # ML pipeline for predictions
├── requirements.txt
└── .env.example
```
