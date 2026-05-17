-- Schema setup
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS components;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS auth_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS pages;

SET FOREIGN_KEY_CHECKS = 1;
CREATE TABLE IF NOT EXISTS users
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)        NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255)        NOT NULL,
    role          VARCHAR(20) DEFAULT 'user',
    created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_tokens (
                             id INT AUTO_INCREMENT PRIMARY KEY,
                             user_id INT NOT NULL,
                             series CHAR(64) NOT NULL,
                             token_hash CHAR(64) NOT NULL,
                             expires_at DATETIME NOT NULL,
                             UNIQUE KEY (series),
                             FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- pass admin123
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin', 'admin@pcbuilder.com', '$2a$12$AIHUZ5WP.5A/f1kwuSOk0uDvIAPHjDJUN6inW8SqA5rSvHWUhT06S', 'admin');
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

CREATE TABLE IF NOT EXISTS orders
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT            NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status      VARCHAR(50) DEFAULT 'saved',
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items
(
    id                INT AUTO_INCREMENT PRIMARY KEY,
    order_id          INT            NOT NULL,
    component_id      INT            NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (component_id) REFERENCES components (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pages
(
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(255)        NOT NULL,
    content      TEXT                NOT NULL,
    slug         VARCHAR(255) UNIQUE NOT NULL,
    is_published BOOLEAN   DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Pages / News
INSERT INTO pages (title, content, slug, is_published)
VALUES 
('Про нас', 'Ласкаво просимо до нашого Онлайн Конфігуратора ПК! Тут ви можете створити комп''ютер своєї мрії, перевірити сумісність деталей та замовити готову збірку. Наша місія - зробити процес підбору комплектуючих простим та приємним для кожного.', 'about-us', 1),
('Новини: Вихід нового покоління процесорів', 'Сьогодні компанія Intel анонсувала нову лінійку процесорів Intel Core Ultra, які обіцяють приріст продуктивності до 20% та суттєве покращення енергоефективності. Вони вже скоро будуть доступні в нашому каталозі для конфігурації!', 'news-intel-ultra', 1),
('Контакти', 'Зв''яжіться з нами для консультації:\nТелефон: +380 99 999 99 99\nEmail: support@pcbuilder.com\nАдреса: м. Київ, вул. Хрещатик, 1', 'contacts', 1);

-- Seed Categories
INSERT INTO categories (id, name, slug)
VALUES (1, 'Processor', 'cpu'),
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
INSERT INTO components (category_id, name, description, price, power_draw_watts, specs, image_url)
VALUES (1, 'AMD Ryzen 7 7800X3D 4.2(5.0)GHz 96MB', 'Top-tier gaming CPU', 15599.00, 120, '{
  "socket": "AM5",
  "cores": 8,
  "threads": 16
}', 'https://content.rozetka.com.ua/goods/images/big/327503063.jpg'),
       (1, 'Intel Core i5-13600K 3.5(5.1)GHz 24MB', 'Great performance for gaming and work', 12999.00, 125, '{
         "socket": "LGA1700",
         "cores": 14,
         "threads": 20
       }', 'https://content.rozetka.com.ua/goods/images/big/366103379.jpg'),

       (2, 'Asus PRIME B650M-K', 'Budget-friendly AM5 motherboard', 5439.00, 30, '{
         "socket": "AM5",
         "ram_type": "DDR5",
         "form_factor": "Micro-ATX",
         "chipset": "B650"
       }', 'https://content1.rozetka.com.ua/goods/images/big/411341498.jpg'),
       (2, 'MSI MAG B650 TOMAHAWK WIFI', 'High-end AM5 ATX board with excellent VRM', 8599.00, 35, '{
         "socket": "AM5",
         "ram_type": "DDR5",
         "form_factor": "ATX",
         "chipset": "B650"
       }', 'https://content2.rozetka.com.ua/goods/images/big/316395240.png'),
       (2, 'Gigabyte B760M DS3H DDR4', 'Reliable LGA1700 board for Intel CPUs', 4599.00, 30, '{
         "socket": "LGA1700",
         "ram_type": "DDR4",
         "form_factor": "Micro-ATX",
         "chipset": "B760"
       }', 'https://content1.rozetka.com.ua/goods/images/big/306616709.jpg'),

       (3, 'Gigabyte GeForce RTX 4070 WINDFORCE OC', 'Perfect for 1440p gaming', 26999.00, 200, '{
         "memory_gb": 12,
         "chipset": "RTX 4070",
         "memory_type": "GDDR6X"
       }', 'https://content.rozetka.com.ua/goods/images/big_tile/509714760.jpg'),
       (3, 'Asus Dual Radeon RX 7800 XT OC', 'Strong RTX 4070 competitor with more VRAM', 25599.00, 263, '{
         "memory_gb": 16,
         "chipset": "RX 7800 XT",
         "memory_type": "GDDR6"
       }', 'https://content1.rozetka.com.ua/goods/images/big_tile/483236964.jpg'),

       (4, 'Kingston FURY Beast Black DDR5 32GB (2x16GB) 6000MHz', 'Optimal speed for new Ryzen CPUs', 4999.00, 10, '{
         "capacity_gb": 32,
         "type": "DDR5",
         "frequency": 6000
       }', 'https://content1.rozetka.com.ua/goods/images/big_tile/290600871.jpg'),
       (4, 'Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz', 'Low-profile and reliable memory kit', 5199.00, 10, '{
         "capacity_gb": 32,
         "type": "DDR5",
         "frequency": 6000
       }', 'https://content.rozetka.com.ua/goods/images/big_tile/418405977.jpg'),
       (4, 'G.Skill Ripjaws V DDR4 32GB (2x16GB) 3600MHz', 'Fast DDR4 memory for LGA1700 builds', 3299.00, 10, '{
         "capacity_gb": 32,
         "type": "DDR4",
         "frequency": 3600
       }', 'https://content.rozetka.com.ua/goods/images/big_tile/493427280.jpg'),

       (5, 'Kingston NV3 3D NAND 1TB M.2', 'Fast and reliable Gen4 M.2 drive', 2699.00, 5, '{
         "capacity_gb": 1000,
         "form_factor": "M.2 2280",
         "interface": "PCI-E 4.0"
       }', 'https://content1.rozetka.com.ua/goods/images/big_tile/458852749.jpg'),
       (5, 'Samsung 990 PRO 2TB M.2', 'Extreme performance for demanding tasks', 7599.00, 7, '{
         "capacity_gb": 2000,
         "form_factor": "M.2 2280",
         "interface": "PCI-E 4.0"
       }', 'https://content1.rozetka.com.ua/goods/images/big_tile/556022593.jpg'),

-- 6. HDD
       (6, 'WD Blue 2TB 7200rpm 256MB', 'Standard mass storage drive', 2399.00, 10, '{
         "capacity_gb": 2000,
         "form_factor": "3.5",
         "rpm": 7200
       }', 'https://content.rozetka.com.ua/goods/images/big_tile/315164976.jpg'),
       (6, 'Seagate Barracuda 4TB 5400rpm 256MB', 'High capacity for backups and media', 4199.00, 8, '{
         "capacity_gb": 4000,
         "form_factor": "3.5",
         "rpm": 5400
       }', 'https://content2.rozetka.com.ua/goods/images/big_tile/11076657.jpg'),

-- 7. Air Cooler
       (7, 'DeepCool AK620', 'High-performance dual-tower cooler', 2899.00, 5, '{
         "type": "Air",
         "tdp_w": 260,
         "height_mm": 160
       }', 'https://content2.rozetka.com.ua/goods/images/big_tile/661544421.png'),
       (7, 'be quiet! Dark Rock Pro 4', 'Virtually inaudible dual-tower cooling', 3799.00, 5, '{
         "type": "Air",
         "tdp_w": 250,
         "height_mm": 163
       }', 'https://content2.rozetka.com.ua/goods/images/big_tile/380183063.jpg'),

-- 8. Liquid Cooler
       (8, 'Arctic Liquid Freezer III 360', 'Quiet and incredibly efficient AIO', 4899.00, 15, '{
         "type": "AIO",
         "radiator_size": 360
       }', 'https://content2.rozetka.com.ua/goods/images/big_tile/562264055.jpg'),
       (8, 'NZXT Kraken 240', 'Sleek design with LCD display pump', 6299.00, 12, '{
         "type": "AIO",
         "radiator_size": 240
       }', 'https://content.rozetka.com.ua/goods/images/big_tile/649501701.jpg'),

-- 9. Thermal Paste
       (9, 'Arctic MX-4 4g', 'Legendary and easy to apply', 249.00, 0, '{
         "weight_g": 4,
         "thermal_conductivity": 8.5
       }', 'https://content1.rozetka.com.ua/goods/images/big_tile/183987890.jpg'),
       (9, 'Thermal Grizzly Kryonaut 1g', 'Premium paste for overclocking', 449.00, 0, '{
         "weight_g": 1,
         "thermal_conductivity": 12.5
       }', 'https://content1.rozetka.com.ua/goods/images/big_tile/412755461.jpg'),

-- 10. Power Supply
       (10, 'Chieftec Polaris 850W', '80 PLUS Gold, fully modular', 4299.00, 0, '{
         "wattage": 850,
         "certificate": "80 PLUS Gold",
         "modular": "Full"
       }', 'https://content1.rozetka.com.ua/goods/images/big_tile/197996834.jpg'),
       (10, 'Corsair RM850x 850W', 'Top-tier reliability and silent operation', 6499.00, 0, '{
         "wattage": 850,
         "certificate": "80 PLUS Gold",
         "modular": "Full"
       }', 'https://content2.rozetka.com.ua/goods/images/big_tile/526541767.jpg'),

-- 11. Case
       (11, 'MSI MAG FORGE 100M Black', 'Good airflow with tempered glass', 2199.00, 0, '{
         "form_factor": "Midi-Tower",
         "motherboard_support": "ATX, Micro-ATX, Mini-ITX"
       }', 'https://content1.rozetka.com.ua/goods/images/big_tile/127812479.jpg'),
       (11, 'NZXT H5 Flow Black', 'Perforated front panel for maximum cooling', 3999.00, 0, '{
         "form_factor": "Midi-Tower",
         "motherboard_support": "ATX, Micro-ATX, Mini-ITX"
       }', 'https://content2.rozetka.com.ua/goods/images/big_tile/475818714.jpg'),

-- 12. Case Fan
       (12, 'Arctic P12 PWM PST Black', 'Quiet pressure-optimized fan', 299.00, 2, '{
         "size_mm": 120,
         "rpm": 1800
       }', 'https://content.rozetka.com.ua/goods/images/big_tile/244301507.jpg'),
       (12, 'Noctua NF-A12x25 PWM', 'Premium fan with ultimate performance/noise ratio', 1299.00, 2, '{
         "size_mm": 120,
         "rpm": 2000
       }', 'https://content1.rozetka.com.ua/goods/images/big_tile/108169159.jpg'),

-- 13. Custom Cables
       (13, '1STPLAYER Steampunk Cable Kit Black/White', 'Sleeved extension cables for neat looks', 1199.00, 0, '{
         "color": "Black/White",
         "material": "Nylon"
       }', 'https://img.telemart.ua/276488-670270-product_popup/evolve-custom-psu-cable-kit-03m-ev-psumf-03bkw-blackwhite.jpg'),
       (13, 'CableMod PRO ModMesh Extension Kit Black', 'Thick and durable premium cables', 2499.00, 0, '{
         "color": "Black",
         "material": "ModMesh"
       }', 'https://content1.rozetka.com.ua/goods/images/big_tile/446169475.jpg'),

-- 14. GPU Holder
       (14, 'DeepCool GH-01', 'Sturdy support for heavy GPUs', 349.00, 0, '{
         "color": "Black",
         "rgb": false
       }', 'https://content2.rozetka.com.ua/goods/images/big_tile/301519157.jpg'),
       (14, 'Cooler Master MasterAccessory ARGB GPU Support', 'Tempered glass support with ARGB lighting', 899.00, 0, '{
         "color": "Clear",
         "rgb": true
       }', 'https://content2.rozetka.com.ua/goods/images/big/326665342.jpg');