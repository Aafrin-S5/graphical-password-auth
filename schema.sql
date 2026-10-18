CREATE DATABASE IF NOT EXISTS graphical_password_db;

USE graphical_password_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    image1 VARCHAR(255) NOT NULL,
    image2 VARCHAR(255) NOT NULL,
    image3 VARCHAR(255) NOT NULL,
    failed_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME NULL
);