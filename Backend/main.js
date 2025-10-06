let mysql = require('mysql');

let con = mysql.createConnection({
  host: "localhost",
  user: "noserq_user",
  password: "password123456"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});