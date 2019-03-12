
var express = require("express");
var bodyParser = require("body-parser");
const https = require('https')
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));


var PORT = 3000;

app.post('/authenticate',function(request,response){
	var val1 = request.body.dataType;
	var val1 = request.body.var1;
	console.log("Authenticate on post");
});


app.listen(PORT);
console.log("Server is running on "+ PORT +" port");




const data = JSON.stringify({
  todo: 'Buy the milk'
})

const options = {
  hostname: 'flaviocopes.com',
  port: 443,
  path: '/todos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', (d) => {
    process.stdout.write(d)
  })
})

req.on('error', (error) => {
  console.error(error)
})

req.write(data)
req.end()

