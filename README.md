# Smart Maternal Emergency Response System (SMERS)

## Executive Summary

SMERS is a full-stack emergency dispatch prototype focused on maternal and neonatal response coordination in resource-constrained settings. The platform demonstrates how real-time triage, fleet assignment, and operations visibility can be integrated into a single decision-support workflow.

This repository contains a working MVP built for simulation, classroom research, and architecture validation. The current implementation supports:

- live emergency intake and queueing
- automated nearest-responder dispatch logic
- map-based operational monitoring
- mission history and payment reporting
- administrator user management

The project was developed as a capstone software engineering project for the SWE4900 class and as evidence of end-to-end system design, implementation, and applied public-health problem framing.

## Problem Context

Maternal emergencies in peri-urban and informal settlement regions are often delayed by fragmented communication, transport bottlenecks, and lack of operational coordination. SMERS addresses this by modeling a centralized dispatch workflow where emergency events are triaged, assigned to available responders, and tracked through resolution.

## Research and Engineering Goals

1. Build an operational prototype that models emergency response dispatch under constrained resources.
2. Validate a simple automated allocation strategy (nearest available responder).
3. Provide role-based interfaces for dispatch and administrative oversight.
4. Create a platform that can be extended for field pilots and longitudinal evaluation.

## Current Capabilities (Implemented)

### Dispatcher Operations

- View a live emergency queue.
- Trigger simulated emergency calls for stress testing.
- Dispatch responders to incidents.
- Monitor active operations and mission progress.

### Main Dashboard (Operations View)

- Map visualization of incidents and responders.
- Live operations feed with priority labeling.
- Priority normalization across numeric and categorical values.

### Administrator Oversight

- Review open cases and completed missions.
- Access financial/payment records linked to incidents.
- Manage system users (create, edit, delete, activate/deactivate).

### Backend API

- Health endpoint for database verification.
- Platform health endpoint for readiness checks.
- Incident CRUD subset (read/create/assign).
- Active responder retrieval.
- Completed mission and payment reporting.
- User management endpoints.

## System Architecture

### Frontend

- React 19
- Material UI 7
- React Router 7
- Leaflet + React Leaflet (map rendering)

### Backend

- Node.js + Express 5
- PostgreSQL via pg driver
- CORS + dotenv middleware/config
- Request payload validation and normalized API error responses

### Data Layer

- PostgreSQL-compatible schema (configured through DATABASE_URL)
- Current code is tested against hosted PostgreSQL (Neon-style connection pattern with SSL)

## Repository Structure

```text
smers/
    backend/
        db.js
        index.js
        .env.example
        package.json
    frontend/
        .env.example
        package.json
        src/
            components/
            pages/
            App.js
```

## Local Setup and Reproducibility

### Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database instance reachable through a connection URL

### 1) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Configure backend environment

Create backend/.env with:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
PORT=5000
NODE_ENV=development
```

You can copy from backend/.env.example.

### 3) Configure frontend environment (optional)

Create frontend/.env with:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

If omitted, the app defaults to the local backend URL above.

### 4) Run the backend

```bash
cd backend
node index.js
```

### 5) Run the frontend

```bash
cd frontend
npm start
```

Frontend runs on [http://localhost:3000](http://localhost:3000) and proxies API traffic to [http://localhost:5000](http://localhost:5000).

## Authentication in MVP

The current login is intentionally lightweight for simulation:

- dispatcher / pass
- admin / pass

These credentials are hardcoded in the frontend and are not production-safe.

## API Overview

Base URL: [http://localhost:5000/api](http://localhost:5000/api)

### Platform Health

- GET /health

### Health

- GET /test-db

### Responders

- GET /responders

### Incidents / Requests

- GET /requests
- POST /requests
- PUT /requests/:id/assign

### Reports

- GET /reports/completed
- GET /payments

### User Management

- GET /users
- POST /users
- PUT /users/:id
- DELETE /users/:id

## Example Request Payloads

### Create Incident

```json
{
    "patient_name": "Jane Wanjiku",
    "contact_number": "0712345678",
    "location_name": "Majengo Stage",
    "symptoms": "Severe bleeding and labor pain",
    "priority": "CRITICAL",
    "latitude": 0.0172,
    "longitude": 37.0715
}
```

### Assign Responder

```json
{
    "responder_id": 2
}
```

## Academic Value

This project demonstrates competence across:

- human-centered problem framing in global/public health
- full-stack software development and API design
- asynchronous workflow modeling and state transitions
- geospatial UI integration
- data-informed dashboarding and operational analytics
- applied systems thinking under real-world constraints

## Limitations (Transparent MVP Boundaries)

1. Authentication and authorization are not production-grade.
2. No encryption-at-rest or secrets vault integration is implemented in code.
3. No integrated CI/CD pipeline is included in this repository.
4. Triage logic is rule-based and should be clinically validated before deployment.
5. External channels (USSD/WhatsApp/SMS) are conceptual in this version, not yet integrated.

## Roadmap

1. Replace hardcoded auth with secure identity provider and role-based access control.
2. Add auditable event logs and stronger data governance controls.
3. Integrate communications APIs (USSD, SMS, WhatsApp) for real incident intake.
4. Introduce queue optimization and explainable dispatch heuristics.
5. Add automated tests, CI, and containerized deployment profiles.

## Suggested Evaluation Metrics

- average dispatch latency
- responder utilization rate
- median time from alert to hospital arrival
- queue aging by severity tier
- incident closure ratio over time

## Course and Project Status

SMERS is an MVP/prototype created for academic software engineering work and simulation. It is not yet approved for live clinical operations.

## License

Apache License 2.0
