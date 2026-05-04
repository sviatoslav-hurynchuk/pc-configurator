# 🖥️ PC Configurator - Architecture & Master Plan

## 1. Project Overview
The Online PC Configurator is a web application that allows users to build compatible computer components into a single build, browse the product catalog, and place orders. The project is developed in accordance with the requirements for the coursework in the "Backend Development" discipline.

**Tech Stack:**
* **Backend:** PHP 8 (strict typing, OOP approach).
* **Architecture:** Strict MVC (Model-View-Controller).
* **Database:** MySQL 8.0 (interaction via the **PDO** library).
* **Frontend:** React / Vanilla JS (Asynchronous data exchange via **JSON**).
* **Infrastructure:** Docker & Docker Compose.

---

## 2. Implementation of Mandatory Modules (Min 5)

According to the requirements, the system consists of 5 independent functional modules:

1. **"Product Catalog" Module (Catalog):** Display of components (CPU, GPU, RAM, etc.) with filtering and pagination.
2. **"Configurator" Module (Builder):** The core of the system. Asynchronous (without page reload) addition of parts to the build, calculation of total cost and power consumption (W).
3. **"Users" Module (Users):** Registration, authorization (based on **Session** and **Cookie**), personal dashboard.
4. **"Orders" Module (Orders):** Saving completed builds to the database, user order history.
5. **"Pages / News" Module (Pages/News):** Dynamic informational pages (e.g., "About Us", "PC World News", "Contacts") managed from the admin panel.

---

## 3. Administration System (Admin Panel)

* **Access:** Protected routing. Access is granted only after verifying login/password (with `password_hash`) and checking the user role (`role === 'admin'`).
* **Functionality (CRUD):** Adding, editing, and deleting components, managing orders, publishing news.
* **Mode Switching:** A special mechanism is provided (a button in the navigation for administrators) "Exit editing mode" for quick transition between the admin panel and the public part of the site.

---

## 4. Fulfillment of Laboratory Work Requirements

The architecture is designed to cover all course topics:

* **Lab 1-2 (PHP Basics, arrays, forms):** Used to process POST requests during registration and validation of input data in the admin panel.
* **Lab 3 (Cookie, Session, Files):** Authorization works via `$_SESSION`. File handling is implemented in the admin panel when uploading component images (`move_uploaded_file`).
* **Lab 4 (OOP in PHP):** The entire backend is built on classes (interfaces, inheritance, encapsulation). MVC Pattern: `Router`, `Controller`, `Model`.
* **Lab 5 (PDO):** All queries to MySQL are executed exclusively through prepared statements of the PDO library for protection against SQL injections.
* **Lab 6 (Asynchronous requests and JSON):** The PC configurator operates via AJAX (Fetch API). The client sends a request to change a part, the backend returns `Content-Type: application/json`.
* **Lab 7 (HTTP statuses and Buffering):**
  * Implemented a `Response` class that uses `ob_start()`, `ob_get_contents()`, and `ob_clean()`.
  * Pages are first generated into a buffer. If an error occurs during generation (e.g., product not found), the buffer is cleared (`ob_clean`), a status code is set (`http_response_code(404)`), and a special error page is displayed.

---

## 5. Database Schema (Entity Relationship)

1. `users` (id, email, password_hash, role, created_at)
2. `categories` (id, name, slug)
3. `components` (id, category_id, name, description, price, power_draw_watts, specs_json, image_url)
4. `orders` (id, user_id, total_price, status, created_at)
5. `order_items` (id, order_id, component_id, price_at_purchase)
6. `pages` (id, title, content, slug, is_published)

---

## 6. Development Roadmap

- [x] **Phase 1: Infrastructure.** Docker setup, DB initialization (`init.sql`).
- [ ] **Phase 2: Core.** Creating base MVC classes (Router, Database PDO, Controller, Model). Implementation of output buffering (Lab 7).
- [ ] **Phase 3: Catalog and Configurator.** Displaying products. Writing a JSON API for data exchange between React/JS and PHP (Lab 6).
- [ ] **Phase 4: Authorization and Users.** Registration, login, sessions (Lab 3).
- [ ] **Phase 5: Admin Panel.** CRUD for components and photo uploads. Logic for exiting editing mode.
- [ ] **Phase 6: Finalization.** "Pages" and "Orders" modules. Testing and report preparation.