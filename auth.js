var express = require("express");
var bodyParser = require("body-parser");
const https = require('https')
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));


var PORT = 3000;

app.post('/authenticate',function(request,response){
	var val1 = request.body.type;
	var val2 = request.body.data;
	console.log("Authenticate on post");
});

app.get('/authenticate',function(request,response){
	var val1 = request.body.type;
	var val2 = request.body.data;
	console.log("Authenticate on get");
});

app.listen(PORT);
console.log("Server is running on "+ PORT +" port");



