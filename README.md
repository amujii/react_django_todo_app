# React & Django REST Framework Todo Application

A modern full-stack Todo application built with Django REST Framework backend and React frontend, based on the reference repository [`LondheShubham153/react_django_demo_app`](https://github.com/LondheShubham153/react_django_demo_app.git).

## Features

- **Django REST Framework Backend**: Complete REST API for task CRUD operations.
  - `GET /api/task-list/` - Fetch all tasks
  - `GET /api/task-detail/<pk>/` - Get specific task details
  - `POST /api/task-create/` - Add new task
  - `POST /api/task-update/<pk>/` - Update task title or status
  - `DELETE /api/task-delete/<pk>/` - Delete task
- **Modern React Frontend**: Glassmorphism UI, real-time statistics, filter tabs (All, Active, Completed), interactive completion toggles, and responsive styling.
- **SQLite Persistence**: Out-of-the-box data storage.
- **Docker Support**: Built-in Dockerfile and docker-compose.yaml configuration.

## Quick Start (Local Development)

### 1. Backend Setup (Django)

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate # On Windows

# Install requirements
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start backend server
python manage.py runserver 8000
```

Backend will be accessible at: `http://127.0.0.1:8000/api/`

### 2. Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

Frontend will be accessible at: `http://localhost:3000/`

## Docker Deployment

```bash
docker-compose up --build
```
