// ======================================================================================
// Get the dependencies
// ======================================================================================

const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");
var functionMaker = require("./functionMaker.js");
// start express application
const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: false}));
app.use("/public", express.static(__dirname + "/public"));

// set view engine to ejs
app.set('view engine', 'ejs');


// ======================================================================================
// Define the different classes
// ======================================================================================

// Abstract class for authentication method
var options = {
  hostname: 'flaviocopes.com',
  port: 443,
  path: '/todos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': 1
  }
}



// ======================================================================================
// Function Definitions
// ======================================================================================
	
    function sayHello()
    {
        return 'hello';
    }

    function sendAuthenticationRequest(response)
    {
        /*
        const req = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`)
        res.on('data', (d) => {
            //Send data to ATM
        });
        req.on('error', (error) => {
            //Throow that shit back to ATM, not our problem
        });
        });
        req.send(data);
        req.end();
        */
        console.log(options);
        writeLog("Sent Auth Request - " + options)
        response.write(options + "<br>");
    }

    function writeLog(logMessage)
    {
        if (!fs.existsSync(__dirname + '/logs')) {
            fs.mkdirSync(__dirname + '/logs', 0744);
        }

        fs.appendFile('logs/log.txt', new Date() + ' ' + logMessage + '\n', function (err) 
        {
            if (err) throw err;
        });
    }

    module.exports = 
    {
        sayHello: sayHello,
        sendAuthenticationRequest: sendAuthenticationRequest
    }

// ======================================================================================
// Application implementation
// ======================================================================================


//

// --------------------------------------------------------------------------------------
// Enable CORS on ExpressJS
// --------------------------------------------------------------------------------------
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// --------------------------------------------------------------------------------------
// Get index page
// --------------------------------------------------------------------------------------
app.get('/', function (req, res, next) {
    res.render('index');
});

// --------------------------------------------------------------------------------------
// Get readme page
// --------------------------------------------------------------------------------------
app.get('/readme', function (req, res, next) {
    res.render('readme');
});

// --------------------------------------------------------------------------------------
// Post authenticate
// --------------------------------------------------------------------------------------
app.post('/authenticate',function(request,response, next)
{
    response.header("Access-Control-Allow-Origin", "*");

    console.log("Authenticate on POST");
    let type = request.body.type;
    let data = request.body.data;

    response.end();
});

// --------------------------------------------------------------------------------------
// Get authenticate
// --------------------------------------------------------------------------------------
var methods = ['PIN', 'PIC', 'NFC', 'CID', 'OTP'];
app.get('/authenticate', function(request, response, next)
{
    // response.header("Access-Control-Allow-Origin", "*");

    console.log("Authenticate on GET");

    console.log(request.body);
    let data = request.body; //verander na query

    let pinFound = false;
    let diffTypes = 0;
    let foundTypes = [];

    for(let i=0; i<data["type"].length; i++)
    {

        // if found array is empty or type received is not in the array
        if(foundTypes.length === 0 || foundTypes.indexOf(data["type"][i]) === -1)
        {

            // add new type to the array
            diffTypes++;
            foundTypes[foundTypes.length] = data["type"][i];
            writeLog("Recieved " + data["type"][i] + " data"); 
        }

        if(data["type"][i] === "PIN"){
            pinFound = true;
        }
    }

    console.log(pinFound);
    console.log(diffTypes);

    if(!pinFound || diffTypes !== 2){
        // No pin given which was required so throow notAuthenticatedException error
        request.on('error', (error) => {
            console.error('notAuthenticatedException' + error);
        });

        throw new Error("notAuthenticatedException");
    }
    else{
        // Authenticate the given data
        let NFCCount = 0;
        let PICCount = 0;
        let CIDCount = 0;
        let PINCount = 0;
        let OTPCount = 0;


        for(let i = 0; i < data["type"].length; i++)
        {
        	for(var j = 0; j < methods.length; j++)
            if(data["type"][i] === methods[j])
            {
               var path = './' +  methods[j] + '.js';
            	var method = require(path);
            	options.hostname = method.returnhostname();
            	options.port = method.returnport();
            	options.hostname = method.returnpath();
            	options.hostname = method.returnmethod();
            	options.hostname = method.returnheaders();

                sendAuthenticationRequest(response);
            }
        }

        
    }

});

// --------------------------------------------------------------------------------------
// Get error
// --------------------------------------------------------------------------------------
app.get('*', function(req, res, next) {
    res.render('error');
});

app.post("/newMethod",async function(req,res){
	try{

		var data = req.body;
		// data.Code;
		if(data.Code == undefined)
			throw "Invalid Input"
		functionMaker.CreateFunction(data);
		/*Send feedback to the person who requested our service*/
		res.json({"status":"Success"});		
		res.end();
	}catch(error){
		console.log(error);
		res.json(JSON.parse("{ 'status': 'Failed', 'message':'Something went wrong check the server' }"));		
		res.end();
		
	}
});

// --------------------------------------------------------------------------------------
// Send response
// --------------------------------------------------------------------------------------
function sendAuthenticationRequest(response)
{
    /*
    const req = https.request(options, (res) => {
       console.log(`statusCode: ${res.statusCode}`)
       res.on('data', (d) => {
          //Send data to ATM
       });
       req.on('error', (error) => {
          //Throow that shit back to ATM, not our problem
       });
    });
    req.send(data);
    req.end();
    */
    console.log(options);
    response.write("Data will be sent to -> " + options);
    response.end();
}

// ======================================================================================
// Specify the port to use
// ======================================================================================
// if the application is run on Heroku use the port Heroku needs
// if the application is run locally choose desired port
let port = process.env.PORT;
if (port == null || port === "") {
    port = 8000;
}
app.listen(port);
console.log("Server is running on PORT => "+port);