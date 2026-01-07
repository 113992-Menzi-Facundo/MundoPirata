-- Datos iniciales para Mundo Pirata
-- Este archivo se ejecuta automáticamente al iniciar la aplicación

-- Insertar tipos de noticias
INSERT IGNORE INTO news_types (id, type) VALUES
(1, 'Noticias del Club'),
(2, 'Partidos'),
(3, 'Fichajes'),
(4, 'Eventos'),
(5, 'Comunicados Oficiales');

-- Insertar tipos de eventos
INSERT IGNORE INTO event_types (id, type) VALUES
(1, 'Partido'),
(2, 'Evento'),
(3, 'Entrenamiento'),
(4, 'Presentación');

-- Crear usuario admin para los eventos (si no existe)
INSERT IGNORE INTO users (id, name, last_name, email, password, role, dni, enabled) VALUES
(1, 'Admin', 'Sistema', 'admin@mundopirata.com', '$2a$10$N.zmdr9k7uOCQb96VdodkuAl7.yvnxdKCJTJz1d5XGWzxdXW15uYy', 'admin', 12345678, true);

-- Insertar ubicaciones del estadio
INSERT IGNORE INTO locations (id, name, capacity, price) VALUES
(1, 'Popular Pirata', 15000, 8000.00),
(2, 'Popular Preferencial', 8000, 12000.00),
(3, 'Platea Cuéllar', 5000, 18000.00),
(4, 'Platea Heredia', 1000, 18000.00),
(5, 'Tribuna Oficial', 3000, 35000.00);

-- Insertar eventos en el calendario
INSERT IGNORE INTO calendar (id, title, detail, author_id, date, event_type_id, state) VALUES
(1, 'Belgrano vs River Plate', 'Partido por la Liga Profesional Argentina - Fecha 15', 1, '2025-01-15', 1, true),
(2, 'Belgrano vs Boca Juniors', 'Superclásico - Liga Profesional Argentina', 1, '2025-02-15', 1, true),
(3, 'Belgrano vs Talleres', 'Derby Cordobés - Clásico Provincial', 1, '2025-03-02', 1, true),
(4, 'Belgrano vs Racing Club', 'Partido por la Liga Profesional - Fecha 25', 1, '2025-03-16', 1, true),
(5, 'Presentación del Plantel 2025', 'Presentación oficial del equipo para la nueva temporada', 1, '2025-01-20', 4, true);

-- Insertar entradas/tickets

-- Entradas para Belgrano vs River Plate (2025-01-15 21:00)
INSERT IGNORE INTO tickets (id, code, location_id, price, date_time, available) VALUES
-- Popular Pirata
(1, 'BEL-RIV-PP-001', 1, 8000.00, '2025-01-15 21:00:00', true),
(2, 'BEL-RIV-PP-002', 1, 8000.00, '2025-01-15 21:00:00', true),
(3, 'BEL-RIV-PP-003', 1, 8000.00, '2025-01-15 21:00:00', true),
(4, 'BEL-RIV-PP-004', 1, 8000.00, '2025-01-15 21:00:00', true),
(5, 'BEL-RIV-PP-005', 1, 8000.00, '2025-01-15 21:00:00', true),
-- Popular Preferencial
(6, 'BEL-RIV-PPF-001', 2, 12000.00, '2025-01-15 21:00:00', true),
(7, 'BEL-RIV-PPF-002', 2, 12000.00, '2025-01-15 21:00:00', true),
(8, 'BEL-RIV-PPF-003', 2, 12000.00, '2025-01-15 21:00:00', true);

-- Entradas para Belgrano vs Boca Juniors (2025-02-15 21:00)
INSERT IGNORE INTO tickets (id, code, location_id, price, date_time, available) VALUES
-- Popular Pirata
(9, 'BEL-BOC-PP-001', 1, 15000.00, '2025-02-15 21:00:00', true),
(10, 'BEL-BOC-PP-002', 1, 15000.00, '2025-02-15 21:00:00', true),
(11, 'BEL-BOC-PP-003', 1, 15000.00, '2025-02-15 21:00:00', true),
-- Platea Cuéllar
(12, 'BEL-BOC-PLAT-001', 3, 18000.00, '2025-02-15 21:00:00', true),
(13, 'BEL-BOC-PLAT-002', 3, 18000.00, '2025-02-15 21:00:00', true),
(14, 'BEL-BOC-PLAT-003', 3, 18000.00, '2025-02-15 21:00:00', true);

-- Entradas para Belgrano vs Talleres (2025-03-02 19:15)
INSERT IGNORE INTO tickets (id, code, location_id, price, date_time, available) VALUES
-- Popular Pirata
(15, 'BEL-TAL-PP-001', 1, 12000.00, '2025-03-02 19:15:00', true),
(16, 'BEL-TAL-PP-002', 1, 12000.00, '2025-03-02 19:15:00', true),
(17, 'BEL-TAL-PP-003', 1, 12000.00, '2025-03-02 19:15:00', true),
-- Popular Preferencial
(18, 'BEL-TAL-PPF-001', 2, 18000.00, '2025-03-02 19:15:00', true),
(19, 'BEL-TAL-PPF-002', 2, 18000.00, '2025-03-02 19:15:00', true);

-- Entradas para Belgrano vs Racing Club (2025-03-16 17:00)
INSERT IGNORE INTO tickets (id, code, location_id, price, date_time, available) VALUES
-- Popular Pirata
(20, 'BEL-RAC-PP-001', 1, 10000.00, '2025-03-16 17:00:00', true),
(21, 'BEL-RAC-PP-002', 1, 10000.00, '2025-03-16 17:00:00', true),
(22, 'BEL-RAC-PP-003', 1, 10000.00, '2025-03-16 17:00:00', true),
-- Platea Heredia
(23, 'BEL-RAC-PH-001', 4, 18000.00, '2025-03-16 17:00:00', true),
(24, 'BEL-RAC-PH-002', 4, 18000.00, '2025-03-16 17:00:00', true);

-- Entradas para Presentación del Plantel (2025-01-20 19:00) - GRATIS
INSERT IGNORE INTO tickets (id, code, location_id, price, date_time, available) VALUES
-- Popular Pirata (precio especial para el evento)
(25, 'BEL-PRES-PP-001', 1, 0.00, '2025-01-20 19:00:00', true),
(26, 'BEL-PRES-PP-002', 1, 0.00, '2025-01-20 19:00:00', true),
(27, 'BEL-PRES-PP-003', 1, 0.00, '2025-01-20 19:00:00', true),
(28, 'BEL-PRES-PP-004', 1, 0.00, '2025-01-20 19:00:00', true),
(29, 'BEL-PRES-PP-005', 1, 0.00, '2025-01-20 19:00:00', true);

-- Insertar destinos de donación
INSERT IGNORE INTO destinations (id, name, address, phone_number, state) VALUES
(1, 'Obras del Estadio', 'Estadio Julio César Villagra', '0351-123-4567', true),
(2, 'Divisiones Inferiores', 'Centro de Entrenamiento', '0351-123-4568', true),
(3, 'Equipamiento Médico', 'Departamento Médico', '0351-123-4569', true);

-- Actualizar nombres de ubicaciones existentes (si ya existen)
UPDATE locations SET name = 'Platea Cuéllar', price = 18000.00, capacity = 5000 WHERE id = 3;
UPDATE locations SET name = 'Platea Heredia', price = 18000.00, capacity = 1000 WHERE id = 4;

-- Actualizar precios de tickets existentes para las ubicaciones corregidas
UPDATE tickets SET price = 18000.00 WHERE location_id = 3;
UPDATE tickets SET price = 18000.00, location_id = 4 WHERE location_id = 5; 