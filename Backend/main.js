
// MySQL database connection details
// Make sure to replace these with your actual database credentials.

const password = "password123456";
const host = "localhost";
const user = "noserq_user";
const database = "ticket-queueworks";



// MySQL connection test

var connect = function() {
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

con.query('SELECT * FROM ticket', function (err, results, fields) {
  if (err) throw err;
  console.log(results);
});

con.end();
}();




