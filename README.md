# ✈️ Aircraft Trajectory Visualizer

This full-stack web application visualizes aircraft trajectories on an interactive map using real geospatial data.

## 🌍 Overview

- **Frontend**: React + TypeScript + Vite + Leaflet
- **Backend**: Node.js + Express + TypeScript
- **Database**: MySQL (used for storing trajectories + waypoints)
- **Map Engine**: Leaflet.js with geospatial overlays
- **Data Format**: `trajectories.jsonl` — each line is a JSON trajectory object

The app displays flight paths as colored polylines, with markers and popups for departure/arrival airports. Filters and search controls allow interactive exploration.

---

## 📦 Project Structure

```bash
thales-trajectories/
├── backend/                  # Express API backend
│   ├── src/
│   │   ├── server.ts         # API entry point
│   │   ├── routes/           # Express routes
│   │   ├── data/             # Load & parse trajectory data
│   └── scripts/              # Seed scripts for DB
│
├── frontend/                 # React + Leaflet map app
│   ├── src/
│   │   ├── App.tsx
│   │   └── components/       # Map, Sidebar, RouteSummary etc
│
├── shared/                   # Shared TypeScript types
└── test-data/                # Edge-case samples for test coverage
```

## 🚀 How to Run the Project

### 🛠 Prerequisites
- Node.js >= 18
- npm (or yarn)
<!-- - MySQL running locally (or a cloud DB) -->

<!-- ### 🔧 Database Seeding
```bash
CREATE DATABASE trajectories_db;
USE trajectories_db;
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=trajectories_db
npx ts-node scripts/seedTrajectories.ts
``` -->

### 🔧 Backend Setup
```bash
cd backend
npm install
npx ts-node src/server.ts
```

### 🔧 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Features
Interactive Leaflet map showing aircraft routes
Recenter to current geolocation
Clickable polylines with route summary (distance, duration, altitudes)
Filter by:
    - Departure & arrival airports
    - Time range (today, last 1h/24h, or custom)
    - Flight ID search with dropdown suggestions
ICAO/IATA toggle, airport name labels
Smart polyline visibility based on map bounds

### Testing
Basic unit tests are included for both frontend and backend.
Backend tests: jest (WIP)
Frontend tests: vitest for component/data utilities

```bash
cd frontend
npm run test
```