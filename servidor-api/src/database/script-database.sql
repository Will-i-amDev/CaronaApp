-- Criar tabela de usuários se não existir
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50),
    phone VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    user_type VARCHAR(20),
    car_model VARCHAR(50),
    car_plate VARCHAR(20)
);

-- Criar tabela de corridas se não existir
CREATE TABLE IF NOT EXISTS rides (
    ride_id INTEGER PRIMARY KEY AUTOINCREMENT,
    passenger_user_id INTEGER,
    pickup_address VARCHAR(100),
    pickup_date DATETIME,
    pickup_latitude VARCHAR(50),
    pickup_longitude VARCHAR(50),
    dropoff_address VARCHAR(100),
    status CHAR(1),
    driver_user_id INTEGER,
    FOREIGN KEY (passenger_user_id) REFERENCES users(user_id),
    FOREIGN KEY (driver_user_id) REFERENCES users(user_id)
);

