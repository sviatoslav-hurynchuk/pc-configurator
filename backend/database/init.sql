-- Schema setup
CREATE TABLE IF NOT EXISTS categories
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50)        NOT NULL,
    slug       VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS components
(
    id               INT AUTO_INCREMENT PRIMARY KEY,
    category_id      INT            NOT NULL,
    name             VARCHAR(255)   NOT NULL,
    description      TEXT,
    price            DECIMAL(10, 2) NOT NULL,
    power_draw_watts INT       DEFAULT 0,
    specs            JSON,
    image_url        VARCHAR(500),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_category
        FOREIGN KEY (category_id)
            REFERENCES categories (id)
            ON DELETE CASCADE
);

-- Seed Categories
INSERT INTO categories (id, name, slug) VALUES
                                            (1, 'Processor', 'cpu'),
                                            (2, 'Motherboard', 'motherboard'),
                                            (3, 'Video Card', 'gpu'),
                                            (4, 'RAM', 'ram'),
                                            (5, 'SSD', 'ssd'),
                                            (6, 'HDD', 'hdd'),
                                            (7, 'Air Cooler', 'cooler'),
                                            (8, 'Liquid Cooler', 'liquid-cooling'),
                                            (9, 'Thermal Paste', 'thermal-paste'),
                                            (10, 'Power Supply', 'psu'),
                                            (11, 'Case', 'case'),
                                            (12, 'Case Fan', 'case-fan'),
                                            (13, 'Custom Cables', 'custom-cables'),
                                            (14, 'GPU Holder', 'gpu-holder');

-- Seed Components (Min 2 per category)
INSERT INTO components (category_id, name, description, price, power_draw_watts, specs, image_url) VALUES

-- 1. CPU
(1, 'AMD Ryzen 7 7800X3D 4.2(5.0)GHz 96MB', 'Top-tier gaming CPU', 15599.00, 120, '{"socket": "AM5", "cores": 8, "threads": 16}', 'https://via.placeholder.com/100'),
(1, 'Intel Core i5-13600K 3.5(5.1)GHz 24MB', 'Great performance for gaming and work', 12999.00, 125, '{"socket": "LGA1700", "cores": 14, "threads": 20}', 'https://via.placeholder.com/100'),

-- 2. Motherboard
(2, 'Asus PRIME B650M-K', 'Budget-friendly AM5 motherboard', 5439.00, 30, '{"socket": "AM5", "form_factor": "Micro-ATX", "chipset": "B650"}', 'https://via.placeholder.com/100'),
(2, 'MSI MAG B650 TOMAHAWK WIFI', 'High-end AM5 ATX board with excellent VRM', 8599.00, 35, '{"socket": "AM5", "form_factor": "ATX", "chipset": "B650"}', 'https://via.placeholder.com/100'),

-- 3. GPU
(3, 'Gigabyte GeForce RTX 4070 WINDFORCE OC', 'Perfect for 1440p gaming', 26999.00, 200, '{"memory_gb": 12, "chipset": "RTX 4070", "memory_type": "GDDR6X"}', 'https://via.placeholder.com/100'),
(3, 'Asus Dual Radeon RX 7800 XT OC', 'Strong RTX 4070 competitor with more VRAM', 25599.00, 263, '{"memory_gb": 16, "chipset": "RX 7800 XT", "memory_type": "GDDR6"}', 'https://via.placeholder.com/100'),

-- 4. RAM
(4, 'Kingston FURY Beast Black DDR5 32GB (2x16GB) 6000MHz', 'Optimal speed for new Ryzen CPUs', 4999.00, 10, '{"capacity_gb": 32, "type": "DDR5", "frequency": 6000}', 'https://via.placeholder.com/100'),
(4, 'Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz', 'Low-profile and reliable memory kit', 5199.00, 10, '{"capacity_gb": 32, "type": "DDR5", "frequency": 6000}', 'https://via.placeholder.com/100'),

-- 5. SSD
(5, 'Kingston NV3 3D NAND 1TB M.2', 'Fast and reliable Gen4 M.2 drive', 2699.00, 5, '{"capacity_gb": 1000, "form_factor": "M.2 2280", "interface": "PCI-E 4.0"}', 'https://via.placeholder.com/100'),
(5, 'Samsung 990 PRO 2TB M.2', 'Extreme performance for demanding tasks', 7599.00, 7, '{"capacity_gb": 2000, "form_factor": "M.2 2280", "interface": "PCI-E 4.0"}', 'https://via.placeholder.com/100'),

-- 6. HDD
(6, 'WD Blue 2TB 7200rpm 256MB', 'Standard mass storage drive', 2399.00, 10, '{"capacity_gb": 2000, "form_factor": "3.5", "rpm": 7200}', 'https://via.placeholder.com/100'),
(6, 'Seagate Barracuda 4TB 5400rpm 256MB', 'High capacity for backups and media', 4199.00, 8, '{"capacity_gb": 4000, "form_factor": "3.5", "rpm": 5400}', 'https://via.placeholder.com/100'),

-- 7. Air Cooler
(7, 'DeepCool AK620', 'High-performance dual-tower cooler', 2899.00, 5, '{"type": "Air", "tdp_w": 260, "height_mm": 160}', 'https://via.placeholder.com/100'),
(7, 'be quiet! Dark Rock Pro 4', 'Virtually inaudible dual-tower cooling', 3799.00, 5, '{"type": "Air", "tdp_w": 250, "height_mm": 163}', 'https://via.placeholder.com/100'),

-- 8. Liquid Cooler
(8, 'Arctic Liquid Freezer III 360', 'Quiet and incredibly efficient AIO', 4899.00, 15, '{"type": "AIO", "radiator_size": 360}', 'https://via.placeholder.com/100'),
(8, 'NZXT Kraken 240', 'Sleek design with LCD display pump', 6299.00, 12, '{"type": "AIO", "radiator_size": 240}', 'https://via.placeholder.com/100'),

-- 9. Thermal Paste
(9, 'Arctic MX-4 4g', 'Legendary and easy to apply', 249.00, 0, '{"weight_g": 4, "thermal_conductivity": 8.5}', 'https://via.placeholder.com/100'),
(9, 'Thermal Grizzly Kryonaut 1g', 'Premium paste for overclocking', 449.00, 0, '{"weight_g": 1, "thermal_conductivity": 12.5}', 'https://via.placeholder.com/100'),

-- 10. Power Supply
(10, 'Chieftec Polaris 850W', '80 PLUS Gold, fully modular', 4299.00, 0, '{"wattage": 850, "certificate": "80 PLUS Gold", "modular": "Full"}', 'https://via.placeholder.com/100'),
(10, 'Corsair RM850x 850W', 'Top-tier reliability and silent operation', 6499.00, 0, '{"wattage": 850, "certificate": "80 PLUS Gold", "modular": "Full"}', 'https://via.placeholder.com/100'),

-- 11. Case
(11, 'MSI MAG FORGE 100M Black', 'Good airflow with tempered glass', 2199.00, 0, '{"form_factor": "Midi-Tower", "motherboard_support": "ATX, Micro-ATX, Mini-ITX"}', 'https://via.placeholder.com/100'),
(11, 'NZXT H5 Flow Black', 'Perforated front panel for maximum cooling', 3999.00, 0, '{"form_factor": "Midi-Tower", "motherboard_support": "ATX, Micro-ATX, Mini-ITX"}', 'https://via.placeholder.com/100'),

-- 12. Case Fan
(12, 'Arctic P12 PWM PST Black', 'Quiet pressure-optimized fan', 299.00, 2, '{"size_mm": 120, "rpm": 1800}', 'https://via.placeholder.com/100'),
(12, 'Noctua NF-A12x25 PWM', 'Premium fan with ultimate performance/noise ratio', 1299.00, 2, '{"size_mm": 120, "rpm": 2000}', 'https://via.placeholder.com/100'),

-- 13. Custom Cables
(13, '1STPLAYER Steampunk Cable Kit Black/White', 'Sleeved extension cables for neat looks', 1199.00, 0, '{"color": "Black/White", "material": "Nylon"}', 'https://via.placeholder.com/100'),
(13, 'CableMod PRO ModMesh Extension Kit Black', 'Thick and durable premium cables', 2499.00, 0, '{"color": "Black", "material": "ModMesh"}', 'https://via.placeholder.com/100'),

-- 14. GPU Holder
(14, 'DeepCool GH-01', 'Sturdy support for heavy GPUs', 349.00, 0, '{"color": "Black", "rgb": false}', 'https://via.placeholder.com/100'),
(14, 'Cooler Master MasterAccessory ARGB GPU Support', 'Tempered glass support with ARGB lighting', 899.00, 0, '{"color": "Clear", "rgb": true}', 'https://via.placeholder.com/100');