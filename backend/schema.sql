CREATE DATABASE placo_db;
USE placo_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL,  -- This will store the SHA-256 hashed password
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,  -- Added UNIQUE constraint here
    company_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    professional_area ENUM('structural_engineering', 'interior_design', 'roofing', 'masonry', 'plumbing') NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    open_to_travel BOOLEAN NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    user_reviewer_id INT NOT NULL,
    user_reviewer_name VARCHAR(100) NOT NULL,
    user_reviewer_occupation VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (user_reviewer_id) REFERENCES users(id)
);

CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'closed') NOT NULL,
    location ENUM('iasi', 'cluj', 'bucuresti') NOT NULL,
    professional_area ENUM('structural_engineering', 'interior_design', 'roofing', 'masonry', 'plumbing') NOT NULL,
    price VARCHAR(255) NOT NULL,
    requirements JSON NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    company_id INT NOT NULL,
    message LONGTEXT NOT NULL,
    delivery_date DATE NOT NULL,
    estimated_price VARCHAR(255) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    UNIQUE (project_id, company_id)
);

-- INSERT INTO users (email, password, role) VALUES ('admin@placo.ro', SHA2('admin123', 256), 'admin');