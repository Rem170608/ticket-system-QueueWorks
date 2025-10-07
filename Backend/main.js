import express from 'express'; // Import Express
import mysql from 'mysql2';     // Use mysql2 for ES modules

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL configuration details
const password = "password123456";
const host = "localhost";
const user = "noserq_user";
const database = "ticket-queueworks";

const con = mysql.createConnection({
  host,
  user,
  password,
  database
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

// Example route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export connection if needed
export default con;
