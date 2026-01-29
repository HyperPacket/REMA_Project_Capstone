# REMA - Real Estate Market Assistant

Welcome to the REMA project! This application is designed to assist in real estate market analysis using advanced machine learning predictions and an interactive map interface.

## Project Structure

The project is divided into two main components:

### 1. Frontend (`frontend/`)
The user interface is built with **React**, **Vite**, and **TailwindCSS**. It helps users visualize real estate data and interact with predictions.

- **Stack**: React, Vite, TailwindCSS, Leaflet (for maps).
  > **Note**: Leaflet maps are currently not working because the backend is not connected.
- **Key Folders**:
  - `src/`: Contains the main application logic, components, and pages.
  - `public/`: Static assets.
- **Setup**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

### 2. Backend (`backend/`)
The server-side logic is powered by **FastAPI** and **PostgreSQL**. It handles data processing, API requests, and machine learning inference.

- **Stack**: FastAPI, PostgreSQL, SQLAlchemy, Ollama (LLM integration).
- **Key Folders**:
  - `app/`: Core application code (`main.py`, `database.py`, etc.).
  - `app/routers/`: API endpoints.
  - `app/ml/`: Machine Learning components.
    - **Note on `REMA_pipeline.pkl`**: This file contains the pre-trained machine learning pipeline used to generate property price predictions. It fits into the same dependency environment defined in `requirements.txt`.
- **Setup**:
  ```bash
  cd backend
  python -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  uvicorn app.main:app --reload
  ```

### 3. Database
The project uses **PostgreSQL** for data persistence.
- **Database Name**: `rema`
- **Config**: Ensure your `.env` file in the `backend/` directory is configured with the correct `DATABASE_URL`.

## Contributors

This project was built by:

- **Zaid**
- **[Contributor Name 2]**
- **[Contributor Name 3]**
