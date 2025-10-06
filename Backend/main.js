let mysql = require('mysql');

let con = mysql.createConnection({
  host: "localhost",
  user: "noserq_user",
  password: "password123456",
  database: "ticket_queueworks"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
