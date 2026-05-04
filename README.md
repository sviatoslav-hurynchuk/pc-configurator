# 🖥️ PC Configurator

This is a fully-fledged web application for selecting computer components, developed using PHP 8, MySQL, and the MVC pattern.

## 🚀 Core Features (According to the Requirements)
* **Asynchrony:** The configurator operates on the Fetch API with data exchange in JSON format (without page reloading).
* **MVC Architecture:** Strict separation of logic (Models), presentation (Views), and control (Controllers).
* **Output Buffering:** The router uses `ob_start()` and `ob_clean()` to generate pages based on HTTP status codes (200, 404, 500).
* **Modularity:** 5+ modules are implemented (Catalog, Configurator, Users, Orders, Info Pages).
* **Admin Panel:** A protected area for content management with the ability to quickly return to client mode.
* **Security:** Database operations exclusively via **PDO**, password hashing, XSS protection.

## 🛠️ Launch Requirements
**Docker** is used for the simplest launch. You must have Docker and Docker Compose installed on your computer.

## ⚙️ Installation Instructions

1. Clone the repository:
```bash
git clone [https://github.com/your-username/pc_configurator.git](https://github.com/your-username/pc_configurator.git)
cd pc_configurator
```

2. Run the containers (PHP 8.2 + Apache, MySQL 8.0, Node.js for the frontend):
```bash
docker compose up -d --build
```

3. The database is initialized automatically thanks to the `backend/database/init.sql` file.

4. Open the application in your browser:
   * **Frontend (React/JS):** `http://localhost:5173`
   * **Backend API / Admin Panel:** `http://localhost:8000`

## 👨‍💻 Test Credentials for Admin Panel
* **Login:** admin@pcbuilder.com
* **Password:** admin123

## 📚 Documentation
A detailed description of the architecture, database structure, and compliance with laboratory works is described in the [ARCHITECTURE.md](ARCHITECTURE.md) file.