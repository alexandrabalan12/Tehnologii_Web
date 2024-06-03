USE placo_db;

-- Populating users table
INSERT INTO users (email, password, role)
VALUES 
('user1@example.com', SHA2('password1', 256), 'user'),
('user2@example.com', SHA2('password2', 256), 'company'),
('user3@example.com', SHA2('password3', 256), 'user'),
('user4@example.com', SHA2('password4', 256), 'company'),
('user5@example.com', SHA2('password5', 256), 'user'),
('user6@example.com', SHA2('password6', 256), 'company'),
('user7@example.com', SHA2('password7', 256), 'user'),
('user8@example.com', SHA2('password8', 256), 'company');

-- Populating companies table
INSERT INTO companies (user_id, company_name, phone_number, description, location, address, professional_area, owner_name, open_to_travel)
VALUES 
(2, 'Company A', '123-456-7890', 'Description for Company A', 'brasov', 'Address A', 'structural_engineering', 'Owner A', TRUE),
(4, 'Company B', '234-567-8901', 'Description for Company B', 'bucuresti', 'Address B', 'interior_design', 'Owner B', FALSE),
(6, 'Company C', '345-678-9012', 'Description for Company C', 'cluj', 'Address C', 'roofing', 'Owner C', TRUE),
(8, 'Company D', '456-789-0123', 'Description for Company D', 'iasi', 'Address D', 'masonry', 'Owner D', FALSE);

-- Populating reviews table
INSERT INTO reviews (company_id, user_reviewer_id, user_reviewer_name, user_reviewer_occupation, rating, review_content)
VALUES 
(1, 1, 'Reviewer 1', 'Occupation 1', 5, 'Excellent work!'),
(2, 3, 'Reviewer 2', 'Occupation 2', 4, 'Very good service.'),
(3, 5, 'Reviewer 3', 'Occupation 3', 3, 'Average performance.'),
(4, 7, 'Reviewer 4', 'Occupation 4', 2, 'Below expectations.'),
(1, 3, 'Reviewer 5', 'Occupation 5', 4, 'Good quality.'),
(2, 5, 'Reviewer 6', 'Occupation 6', 5, 'Outstanding experience.'),
(3, 7, 'Reviewer 7', 'Occupation 7', 1, 'Very poor service.'),
(4, 1, 'Reviewer 8', 'Occupation 8', 3, 'Satisfactory.');

-- Populating projects table
INSERT INTO projects (user_id, name, description, status, location, professional_area, price, requirements)
VALUES 
(1, 'Project A', 'Description for Project A', 'open', 'brasov', 'structural_engineering', '1000', '[
    {
        "name": "Solar Panel Installation",
        "description": "Install solar panels on rooftops of urban buildings."
    },
    {
        "name": "Wind Turbine Setup",
        "description": "Set up small wind turbines in open urban areas."
    }
]'),
(3, 'Project B', 'Description for Project B', 'closed', 'bucuresti', 'interior_design', '2000', '[
    {
        "name": "Solar Panel Installation",
        "description": "Install solar panels on rooftops of urban buildings."
    },
    {
        "name": "Wind Turbine Setup",
        "description": "Set up small wind turbines in open urban areas."
    }
]'),
(5, 'Project C', 'Description for Project C', 'open', 'cluj', 'roofing', '3000', '[
    {
        "name": "Solar Panel Installation",
        "description": "Install solar panels on rooftops of urban buildings."
    },
    {
        "name": "Wind Turbine Setup",
        "description": "Set up small wind turbines in open urban areas."
    }
]'),
(7, 'Project D', 'Description for Project D', 'closed', 'iasi', 'masonry', '4000', '[
    {
        "name": "Solar Panel Installation",
        "description": "Install solar panels on rooftops of urban buildings."
    },
    {
        "name": "Wind Turbine Setup",
        "description": "Set up small wind turbines in open urban areas."
    }
]'),
(1, 'Project E', 'Description for Project E', 'open', 'timisoara', 'plumbing', '5000', '[
    {
        "name": "Solar Panel Installation",
        "description": "Install solar panels on rooftops of urban buildings."
    },
    {
        "name": "Wind Turbine Setup",
        "description": "Set up small wind turbines in open urban areas."
    }
]'),
(3, 'Project F', 'Description for Project F', 'closed', 'brasov', 'structural_engineering', '6000', '[
    {
        "name": "Solar Panel Installation",
        "description": "Install solar panels on rooftops of urban buildings."
    },
    {
        "name": "Wind Turbine Setup",
        "description": "Set up small wind turbines in open urban areas."
    }
]'),
(5, 'Project G', 'Description for Project G', 'open', 'bucuresti', 'interior_design', '7000', '[
    {
        "name": "Solar Panel Installation",
        "description": "Install solar panels on rooftops of urban buildings."
    },
    {
        "name": "Wind Turbine Setup",
        "description": "Set up small wind turbines in open urban areas."
    }
]'),
(7, 'Project H', 'Description for Project H', 'closed', 'cluj', 'roofing', '8000', '[
    {
        "name": "Solar Panel Installation",
        "description": "Install solar panels on rooftops of urban buildings."
    },
    {
        "name": "Wind Turbine Setup",
        "description": "Set up small wind turbines in open urban areas."
    }
]');

-- Populating job_applications table
INSERT INTO job_applications (project_id, company_id, message, delivery_date, estimated_price)
VALUES 
(1, 1, 'We are interested in your project.', '2024-07-01', '1100'),
(2, 2, 'Looking forward to working on this.', '2024-08-01', '2200'),
(3, 3, 'We can start immediately.', '2024-09-01', '3300'),
(4, 4, 'Excited about this opportunity.', '2024-10-01', '4400'),
(5, 1, 'We have the right expertise.', '2024-11-01', '5500'),
(6, 2, 'Our team is ready.', '2024-12-01', '6600'),
(7, 3, 'We can meet your requirements.', '2024-06-15', '7700'),
(8, 4, 'We have prior experience.', '2024-07-15', '8800');
