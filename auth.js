
var express = require("express");
var bodyParser = require("body-parser"); lines (6 sloc)  164 Bytes

var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));


var PORT = 3000;

app.post('/authenticate',function(request,response){
	var val1 = request.body.var1;
	var val1 = request.body.var1;
	console.log("Authenticate on post");
});


app.listen(PORT);
console.log("Server is running on "+ PORT +" port");

