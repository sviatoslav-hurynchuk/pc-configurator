-- Create categories table
CREATE TABLE IF NOT EXISTS categories
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50)        NOT NULL,
    slug       VARCHAR(50) UNIQUE NOT NULL, -- Used for URL (e.g., 'cpu', 'gpu')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create components table
CREATE TABLE IF NOT EXISTS components
(
    id               INT AUTO_INCREMENT PRIMARY KEY,
    category_id      INT            NOT NULL,
    name             VARCHAR(255)   NOT NULL,
    description      TEXT,
    price            DECIMAL(10, 2) NOT NULL, -- Format: 99999999.99
    power_draw_watts INT       DEFAULT 0,     -- Useful for calculating PSU requirements
    specs            JSON,                    -- Flexible specifications (socket, ram_type, form_factor)
    image_url        VARCHAR(500),            -- Can be an external HTTP link or local path
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key to link component to its category
    CONSTRAINT fk_category
        FOREIGN KEY (category_id)
            REFERENCES categories (id)
            ON DELETE CASCADE
);

-- ==========================================
-- SEED DATA
-- ==========================================

INSERT INTO categories (name, slug)
VALUES ('Processors', 'cpu'),
       ('Motherboards', 'motherboard'),
       ('Video Cards', 'gpu');

INSERT INTO components (category_id, name, description, price, power_draw_watts, specs, image_url)
VALUES (1, 'AMD Ryzen 5 7600X', 'Great 6-core processor for gaming', 229.99, 105, '{
  "socket": "AM5",
  "cores": 6,
  "threads": 12
}', 'https://example.com/ryzen7600x.jpg'),
       (1, 'Intel Core i5-13600K', '14-core hybrid CPU', 319.99, 125, '{
         "socket": "LGA1700",
         "cores": 14,
         "threads": 20
       }', 'https://example.com/i513600k.jpg'),
       (2, 'MSI MAG B650 TOMAHAWK', 'Solid AM5 motherboard with Wi-Fi', 219.99, 30, '{
         "socket": "AM5",
         "form_factor": "ATX"
       }', 'https://example.com/b650.jpg'),
       (3, 'NVIDIA GeForce RTX 4070', 'Excellent 1440p gaming card', 599.99, 200, '{
         "memory_gb": 12,
         "chipset": "RTX 4070"
       }', 'https://example.com/rtx4070.jpg');