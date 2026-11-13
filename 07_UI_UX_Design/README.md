# SEVA Crop Storage Innovation - UI/UX Frontend Application

This folder contains the complete interactive UI/UX frontend prototype for the **SEVA Crop Storage & Preservation Platform**.

## Overview
The application provides an intuitive, accessible web dashboard and interface tailored for farmers and storage operators. Key capabilities include:
- Cold storage facility discovery, availability tracking, and booking.
- Government agricultural subsidy & support scheme discovery.
- Farmer application status tracking.
- Interactive dashboard for farmers and storage operators.
- Clean, responsive mobile-friendly UI built with React and Tailwind CSS.

## Tech Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **Routing:** React Router v7

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
# Navigate to this directory
cd 07_UI_UX_Design

# Install dependencies
npm install
```

### Backend connection
Login, storages and applications come from the FastAPI backend in `../08_Development`.
The frontend reads the backend address from `VITE_API_URL`:

```bash
cp .env.example .env        # default: http://localhost:8000
```

For deployment, set `VITE_API_URL` to the public backend URL (for example
`https://seva-api.onrender.com`) **before** running `npm run build`. On the backend, set
`CORS_ORIGINS` to the frontend's URL and a strong `SECRET_KEY`.

Start the backend first:
```bash
cd ../08_Development
pip install -r requirements.txt
python seed.py              # sample storages + operator login (9000000000 / operator123)
uvicorn main:app --reload
```

Farmers register with a mobile number and a password (at least 6 characters).
Quantities are shown in quintals; the API stores kg (1 quintal = 100 kg).

### Running Locally
```bash
# Start the Vite development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```
