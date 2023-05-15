INSERT INTO departments (departmentName)
VALUES 
('Executive Board'),
('Marketing'),
('Human Resources'),
('Finance'),
('Engineering'),
('IT and Infrastructure'),
('Customer Relations'),
('Research and Development'),
('Legal'),
('Maintenance');

INSERT INTO roles (title, salary, departmentId)
VALUES 
('C.E.O', 1000000, 1),
('Marketing Manager', 150000, 2),
('HR Director', 130000, 3),
('Account Director', 180000, 4),
('Senior Engineer', 150000, 5),
('IT Manager', 125000, 6),
('Customer Relations Manager', 75000, 7),
('Research and Development Manager ', 180000, 8),
('Legal Manager', 200000, 9),
('Maintenance Manager', 135000, 10);

INSERT INTO employee (firstName, lastName, roleId, managerId)
VALUES
('Jane', 'Doe', 1, 1),
('John', 'Smith', 2, 2),
('Sarah', 'Anderson', 3, 3),
('Samuel', 'De Jesus', 4, 4),
('Jay', 'Arbelo', 5, 5),
('Emma', 'Stone', 6, 6),
('Chris', 'Holland', 7, 7),
('Laura', 'De Leon', 8, 8),
('Thomas', 'Garcia', 9, 9),
('Emily', 'Cruise', 10, 10);
