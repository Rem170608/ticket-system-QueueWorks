# Ticket system by QueueWorks

This is a easy to use and User friendly Ticket Syste, for everyone.

## Description

An in-depth paragraph about your project and overview of use.

## Roadmap

- [ ] Simple GUI  
  - [X] Landing page  
  - [ ] Live Tickets  
  - [ ] Admin Panel / Login  
- [ ] Basic Features
  - [X] Database
  - [X] Ticket Category
  - [X] Ticket Message
  - [ ] Lehrjahr Filter
  - [ ] Delete Ticket
- [ ] Advanced Features  
  - [X] Mass delete
  - [ ] Ticket IP
  - [ ] Autodelete at 00:00 CEST (UTC+2)
  - [ ] Login Cookie
  - [ ] Dark Mode

## Getting Started

### Dependencies

- Describe any prerequisites, libraries, OS version, etc., needed before installing program.

- ex. Windows 10

### Installing

- How/where to download your program
- Any modifications needed to be made to files/folders

### Executing program

- How to run the program
- Step-by-step bullets

```JS
code blocks for commands
```

## Help

Easy setup with this MySql query

**Important**: Replace the password with your own, secure password. Note that the password is again used in the main.js file where you also need to replace it.

```MySql
-- Create the database
CREATE DATABASE IF NOT EXISTS `ticket-queueworks`;
USE `ticket-queueworks`;

-- Create the table
CREATE TABLE IF NOT EXISTS `ticket` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `cat` VARCHAR(255) NULL,
    `LJ` VARCHAR(255) NULL,
    `msg` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create one user with full access
CREATE USER IF NOT EXISTS 'noserq_user'@'%' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON `ticket-queueworks`.* TO 'noserq_user'@'%';
FLUSH PRIVILEGES;

```

## Test Data

```MySql
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'John Doh', 'Q', 'Praxis', 'Help me with Git pls', current_timestamp());
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'Max Musster', 'I', 'Praxis', 'yeah this is fine', current_timestamp());
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'Jason Derulo', 'C', 'Basis', 'Help', current_timestamp());
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'Jana Doh', 'C', 'Praxis', 'Who is this', current_timestamp());
INSERT INTO `ticket` (`id`, `name`, `cat`, `LJ`, `msg`, `time`) VALUES (NULL, 'John david', 'Q', 'Praxis', 'Test data is Goofy', current_timestamp());
```

## Authors

Contributors names and contact info
[Leon](https://github.com/lelelon225) \
[rem](https://github.com/Rem170608)

## Version History

--no

## License

This project is licensed under the MIT License - see the LICENSE.md file for details
