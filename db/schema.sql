DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;
USE employee_db;

CREATE TABLE departments (
    id INT NOT NULL AUTOINCREMENT PRIMARY KEY,
    departmentName VARCHAR(30) NOT NULL
);

CREATE TABLE roles(
    id INT NOT NULL AUTOINCREMENT PRIMARY KEY,
    title VARCHAR(30),
    salary INT,
    departmentId int,
    FOREIGN KEY (departmentId)
    REFERENCES departments(id)
    ON DELETE SET NULL
);


CREATE TABLE employee (
id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
firstName VARCHAR(30) NOT NULL,
lastName VARCHAR(30) NOT NULL,
role_id INT,
manager_id INT NOT NULL
);