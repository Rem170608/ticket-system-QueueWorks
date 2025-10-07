let mysql = require('mysql');

let con = mysql.createConnection({
  host: "localhost",
  user: "noserq_user",
  password: "password123456",
  database: "ticket-queueworks"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

con.query('SELECT * FROM ticket', function (err, results, fields) {
  if (err) throw err;
  console.log(results);
});