# Ticket system by QueueWorks

This is a easy to use and User friendly Ticket Syste, for everyone.

## Description

An in-depth paragraph about your project and overview of use.

## Roadmap

- [X] Simple GUI  
  - [X] Landing page  
  - [X] Live Tickets  
  - [X] Admin Panel / Login  
- [X] Basic Features
  - [X] Database
  - [X] Ticket Category
  - [X] Ticket Message
  - [X] Lehrjahr Filter
  - [X] Delete Ticket
- [ ] Advanced Features  
  - [X] Mass delete
  - [X] Bad actor Prevention
  - [ ] Autodelete at 00:00 CEST (UTC+2)
  - [X] Login Cookie
  - [ ] Dark Mode
  - [X] Docker

## Getting Started

### Dependencies

This project runs on Node.js and uses the following main libraries:

- express – web server framework to handle routes and API endpoints

- mysql – used for MySQL database connection and queries

- mysql2 – improved MySQL client with Promise support

Make sure you have:

- [Node.js (v18 or later recommended)](#nodejs)

- [MySQL Server installed and running](https://www.apachefriends.org/download.html)

- [A configured database (see Installing Sql DB)](#mysql-tickets)

### Installing

#### Node.js

#### MySql DB

##### Mysql Tickets

**Important**: Replace the password with your own, secure password. Note that the password is again used in the main.js file where you also need to replace it.

```MySql
-- Create the database
CREATE DATABASE IF NOT EXISTS `ticket-queueworks`;
USE `ticket-queueworks`;

CREATE TABLE IF NOT EXISTS `ticket` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `cat` VARCHAR(255) NULL,
    `LJ` VARCHAR(255) NULL,
    `msg` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the admin_users table
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert an admin user
INSERT INTO `admin_users` (username, password) VALUES ('admin_user', 'secure_password_here');

-- Optionally create a user with full access
CREATE USER IF NOT EXISTS 'noserq_user'@'%' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON `ticket-queueworks`.* TO 'noserq_user'@'%';
FLUSH PRIVILEGES;
```

#### Mysql Login

### Executing program

Navigate To the Save location of the Programm copy the path to the Backend folder.

**Important** make sure you have all of the aformentioned [Dependencies](#dependencies) installed.

```Bat
  cd "yourpath\Backend" 
  node main.js
```

## Help

## Test Data

```MySql
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'John Doh', 'Q', 'Praxis', 'Help me with Git pls', current_timestamp());
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'Leon Hebeisen', 'I', 'Praxis', 'yeah this is fine', current_timestamp());
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'Jason Derulo', 'C', 'Basis', 'Help', current_timestamp());
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'Jana Doh', 'C', 'Praxis', 'Who is this', current_timestamp());
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'John david', 'Q', 'Praxis', 'Test', current_timestamp());
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'Marcel david', 'Q', 'Praxis', 'Dr.House', current_timestamp());
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'Franz Herrmann', 'Q', 'Praxis', 'Test12 Test 23', current_timestamp());
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'Mike david', 'Q', 'Praxis', 'Main Coon cat', current_timestamp());
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'Raffael Maier', 'Q', 'Praxis', 'you', current_timestamp());
```

## Authors

Contributors names and contact info \
[Leon](https://github.com/lelelon225) \
[rem](https://github.com/Rem170608)

## Version History

--no

## License

This project is licensed under the MIT License - see the LICENSE.md file for details
