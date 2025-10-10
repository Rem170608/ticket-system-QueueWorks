# Ticket system by QueueWorks
### Quick Install 

Choose your operating system:

---

####  macOS

One-line install using Homebrew:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh) && \
  brew install node mysql && \
  brew services start mysql && \
  npm install -g node-schedule express mysql2 cors jsonwebtoken"
```

---

####  Windows

One-line install using Chocolatey:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; \
  [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; \
  iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1')) && \
  choco install -y nodejs mysql && \
  npm install -g node-schedule express mysql2 cors jsonwebtoken
```

---

### What Gets Installed:

 **Required Software:**
- Node.js - Powers the backend server
- MySQL - Handles the database

 **NPM Packages:**
- node-schedule: Automatic ticket cleanup
- express: Web server framework
- mysql2: Database connection
- cors: Cross-origin requests
- jsonwebtoken: Authenticationo use and User friendly Ticket Syste, for everyone.

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
- [X] Advanced Features  
  - [X] Mass delete
  - [X] Bad actor Prevention
  - [x] Autodelete at 00:00 CEST (UTC+2)
  - [X] Login Cookie
  - [X] Dark Mode
  - [X] Docker



## Installing

### Node.js

### MySql DB

#### Mysql Tickets

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
    `time` TIME DEFAULT CURRENT_TIMESTAMP
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
