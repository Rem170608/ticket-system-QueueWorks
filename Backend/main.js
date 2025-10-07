// MySQL database connection details

const password = "password123456";
const host = "localhost";
const user = "noserq_user";
const database = "ticket-queueworks";

let mysql = require('mysql');

let con = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database: database
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!"); 
});

// Export the connection
export default con;
