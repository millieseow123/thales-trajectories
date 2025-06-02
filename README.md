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
- npm 
- MySQL running locally 

### 🔧 Database Seeding
First, create your database in MySQL:
```sql
CREATE DATABASE trajectories_db;
USE trajectories_db;
```

Next, create a `.env` file in `backend/` with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=trajectories_db
```

Then run the seed script:
```bash
npx ts-node scripts/seedTrajectories.ts
```

### 🔧 Backend Setup
```bash
cd backend
npm install
npx ts-node src/server.ts
```
Your backend will run on: [http://localhost:4000](http://localhost:4000)

### 🔧 Environment Variables

Create a `.env` file in the root of the frontend project:
```bash
VITE_API_URL=http://localhost:4000
```

### 🔧 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.


### Features
- Interactive Leaflet map showing aircraft routes
- Recenter to current geolocation
- Clickable polylines with route summary (distance, duration, speed, altitude)
- Collapsible sidebar which filters by:
    - Flight ID search with dropdown suggestions
    - Departure & arrival airports
    - Time range (today, last 1h/24h, or custom)
- Legend: ICAO/IATA toggle, airport name labels
- Legend with speed-based color matching: The legend displays color codes for trajectory segments based on speed (e.g., green for slow, yellow for medium, red for fast), helping you visually interpret flight speeds at a glance
- Smart polyline visibility based on map bounds
- Speed-colored trajectories on selection: When you click a polyline, the selected trajectory is highlighted and its segments are colored according to their calculated speed, allowing you to analyze speed variations along the route

### Testing
Basic unit tests are included for both frontend and backend:

- **Frontend tests**: Written with [`vitest`](https://vitest.dev/) for component and utility logic
- **Backend tests**: Written with [`jest`](https://jestjs.io/) for API and data-loading logic

### Running Frontend Tests
```bash
cd frontend
npm install
npm run test
```

### Running Backend Tests
```bash
cd backend
npm install
npm run test
```