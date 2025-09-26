# Smart Maternal Emergency Response System (SMERS)

## Project Overview
This project aims to develop a **Smart Maternal Emergency Response System (SMERS)** to address the critical issue of maternal and neonatal mortality in Kenya's urban informal settlements. The system will leverage a dual-channel mobile interface (USSD and WhatsApp) to connect expectant mothers with a community-based transport network, facilitating a rapid emergency response.

## Technology Stack
- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Databases:** PostgreSQL (for structured data), MongoDB (for unstructured data)
- **Communication:** Twilio API (for USSD and WhatsApp)

## Getting Started
To get the project up and running, follow these steps:

### Prerequisites
- Node.js and npm installed on your machine.
- PostgreSQL and MongoDB running locally or on a cloud service.
- A Twilio account and API keys.

### Installation
1.  Clone the repository:
    `git clone [repository-url]`
2.  Navigate to the project directories and install dependencies:
    `cd frontend && npm install`
    `cd ../backend && npm install`

### Configuration
1.  Create a `.env` file in the `backend` directory.
2.  Add your database connection strings and Twilio API keys to the `.env` file.

### Running the Application
1.  Start the backend server:
    `cd backend && npm start`
2.  Start the React frontend:
    `cd ../frontend && npm start`

## Project Status
This project is a Minimum Viable Product (MVP) developed for the SWE4900A course. It is intended to be a functional prototype for simulation and evaluation, not a full-scale, real-world deployment.

## License
This project is licensed under the Apache License 2.0.