# 🖥️ PC Builder (Custom PC Configurator)

Educational web application for custom PC building with component compatibility validation. The project is built on a decoupled Headless architecture (REST API) using the MVC design pattern.

## 🛠 Tech Stack

* **Frontend:** React (Vite), JavaScript
* **Backend:** PHP 8.2 (Vanilla, MVC Pattern, OOP)
* **Database:** MySQL 8.0 (PDO)
* **Infrastructure:** Docker & Docker Compose

## 📂 Project Structure

The project is divided into two independent environments:
* `/backend` — PHP REST API (Front Controller, routing, DB operations).
* `/frontend` — React SPA (User Interface, state management, API interaction).

## 🚀 How to Run Locally

The project is fully containerized. You only need **Docker Desktop** installed on your machine.

1. Open a terminal in the project's root directory.
2. Run the following command to build and start the containers:
   ```bash
   docker compose up --build -d
   ```
3. Once the setup is complete, the services will be available at:
   * **Frontend (React UI):** [http://localhost:5173](http://localhost:5173)
   * **Backend (PHP API):** [http://localhost:8000](http://localhost:8000)
   * **Database (MySQL):** `localhost:3306` (User: `root`, Pass: `root`, DB: `pc_builder`)

## 🎯 Main Features (In Progress)

- [ ] Asynchronous loading of the components catalog.
- [ ] Interactive part selection with total price and power consumption calculation.
- [ ] Basic compatibility validation (e.g., CPU and Motherboard socket matching).
- [ ] Role-based authorization system (Admin, Editor, User).
- [ ] Saving custom builds to the database for authenticated users.
- [ ] Caching catalog requests to reduce DB load.
- [ ] Rate Limiting (spam protection for saving configurations).
- [ ] Traffic and HTTP response logging (statistics tracking).

---