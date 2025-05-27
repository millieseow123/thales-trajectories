# ✈️ Thales AIR Lab: Aircraft Trajectory Visualizer

This full-stack web application visualizes aircraft trajectories on an interactive map using real geospatial data.

## 🌍 Overview

- **Frontend**: React + TypeScript + Vite + Leaflet
- **Backend**: Node.js + Express + TypeScript
- **Data Format**: `trajectories.jsonl` — each line is a JSON trajectory object

The application renders polylines for aircraft flight paths, with departure/arrival airports marked and color-coded by route.

---

## 📦 Project Structure

thales-trajectories/
├── backend/ ← Express API serving trajectory data
│ ├── src/
│ │ ├── server.ts
│ │ ├── routes/
│ │ └── data/
│ └── tsconfig.json
│
├── frontend/ ← React + Leaflet map visualization
│ ├── src/
│ │ ├── App.tsx
│ │ └── components/
│ └── tsconfig.json


---

## 🚀 How to Run the Project

### 🛠 Prerequisites
- Node.js >= 18
- npm (or yarn)

### 🔧 Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 🔧 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Features
Visualizes aircraft trajectories as polylines on a Leaflet map
Color-coded by departure-arrival (adep-ades) pair
Departure and arrival points labeled with ICAO codes
Dynamic rendering of multiple trajectories from backend API

### Testing
Basic unit tests are included for both frontend and backend.
Backend tests: jest (WIP)
Frontend tests: vitest (optional)


