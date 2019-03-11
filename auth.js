ar express = require("express");
var app = express();

var PORT = 3000;

app.listen(PORT, function () {
  console.log("Server is running on "+ PORT +" port");
});

