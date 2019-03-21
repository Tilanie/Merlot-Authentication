// ======================================================================================
// Get the dependencies
// ======================================================================================

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
var functionMaker = require("./functionMaker.js");
const session = require('express-session');
const uuid = require('uuid/v4');

// start express application
const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: false}));
app.use("/public", express.static(__dirname + "/public"));

// set view engine to ejs
app.set('view engine', 'ejs');

//To enable sessions
app.use(session({
    genid: function(req) {
        return uuid(); // use UUIDs for session IDs
    },
    secret: 'yolo',
    cookie: {
        path: "/",
        maxAge:  1800000  //30 mins
    }
}));

// ======================================================================================
// Function Definitions
// ======================================================================================
function writeLog(mesg, type)
{
    if (!fs.existsSync(__dirname + '/logs')) {
        fs.mkdirSync(__dirname + '/logs', 0o744);
    }

    var logEntry = 
    {
        "date" : new Date(),
        "label" : "Merlot-Authentication",
        "type" : type,
        "message" : mesg
    }

    fs.appendFile('logs/log.txt', JSON.stringify(logEntry) + '\n', function (err)
    {
        if (err) throw err;
    });
}

function logInfo(mesg)
{
    writeLog(mesg, 'info');
}

function logWarning(mesg)
{
    writeLog(mesg, 'warn');
}

function logError(mesg)
{
    writeLog(mesg, 'error');
}

function logRequest(mesg)
{
    writeLog(mesg, 'request');
}

function logResponse(mesg)
{
    writeLog(mesg, 'response');
}

module.exports =
{
    sendAuthenticationRequest: sendAuthenticationRequest
};


function sendAuthenticationRequest(options)
{
    const https = require('https');
    const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', (d) => {
        process.stdout.write(d);
        })
    })

    req.on('error', (error) => {
        logError(error);
    })

    var jsonData = JSON.stringify(data);
    req.write(jsonData);
    req.end();
    logRequest(options);
    return "Data will be sent to -> " + options.hostname;
}

// ======================================================================================
// Application implementation
// ======================================================================================


// --------------------------------------------------------------------------------------
// Enable CORS on ExpressJS
// --------------------------------------------------------------------------------------
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// --------------------------------------------------------------------------------------
// Get newMethod
// {
//   hostname: 'flaviocopes.com',
//   port: 443,
//   path: '/todos',
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Content-Length': 1
//   }
// --------------------------------------------------------------------------------------
var methods = [];

fs.readFile('methods.json', (err, data) => {  
    if (err) throw err;
    let typesOfMethods = JSON.parse(data);
     methods = typesOfMethods;
    console.log(methods);
});

//===== finding methods available =======

console.log('This is after the read call'); 

app.get("/newMethod",async function(req,res){
    try{
        console.log("new function creating");
        var data = req.body;
        // data.Code;
        if(data.methodname == undefined)
            throw "Invalid Input";
        functionMaker.CreateFunction(data);
        /*Send feedback to the person who requested our service*/
        res.json({"status":"Success"});     
        methods.push(data.methodname);
        let methodData = JSON.stringify(methods);  
        fs.writeFileSync('methods.json', methodData);
        res.end();
    }catch(error){
        logError(error);
        res.json(JSON.parse("{ 'status': 'Failed', 'message':'Something went wrong check the server' }"));      
        res.end();
        
    }
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
    console.log("Authenticate on POST");
    let type = request.body.type;
    let data = request.body.data;

    response.end();
});

// --------------------------------------------------------------------------------------
// Get authenticate
// --------------------------------------------------------------------------------------

let j;

const data = {
  data1: 'data to verify',
  data1: 'more data if needed'
}
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

app.get('/authenticate', function(request, response)
{
    let sess = request.session;

    // for browser
    // console.log(request.query);
    // let data = request.query;
    // for api

    let data = request.query; //change!!!!!!!
    console.log(data);

    /*
     *  The only reason we'd extend a session over multiple connections is for:
     *      1) Counting number of tries the user has expended
     *      2) Awaiting an OTP authentication
     */

    // If the session is new then start new session.
    if(!sess.bankID)
    {
        // If the bank didn't send an ID, throw an error
        console.log(data);
        if(!data["ID"])
        {
            j = JSON.parse('{ "success" : false, "data" : "No bank ID sent."}');
            response.json(j);
            response.end();
            logWarning('Recieved no bank id');
            return;
        }

        sess.bankID = data["ID"];

        console.log("\n===============================");
        console.log("New sessions with bank " + sess.bankID);
        console.log(sess.id);
        console.log("===============================\n");

        // Store number of tries per request here
        sess.PICTries = 0;
        sess.PINTries = 0;
        sess.OTPTries = 0;
        sess.CIDTries = 0;
        sess.NFCTries = 0;
    }

    console.log("\nAuthenticate on GET from bank -> " + sess.bankID + "\n");
    logInfo("\nAuthenticate on GET from bank -> " + sess.bankID);

    let pinFound = false;
    let diffTypes = 0;
    let foundTypes = [];
    let responses = [];

    // If it is a returning OTP request, handle it
    if(sess.waitingforOTP)
    {
        let OTPFound = -1;

        for(let i = 0; i < data["type"].length; i++)
        {
            if(data["type"][i] === "OTP")
            {
                OTPFound = i;
                break;
            }
        }

        if(OTPFound === -1)
        {
            j = JSON.parse('{ "success" : false, "data" : "Expecting an OTP."}');
            response.json(j);
            response.end();
            logResponse(response);
            return;
        }

        // Handle returning OTP request
        console.log("Received OTP, handling...");

        // Validate the sent OTP with the one that was generated in previous call
        let success = true;

        if(success)
            j = JSON.parse('{ "success" : true, "data" : "someCustomerID"}');
        else
            j = JSON.parse('{ "success" : false, "data" : "notAuthenticatedException"}');

        response.json(j);
        response.end();

        console.log("Destroying session");
        // Destroy session
        sess.destroy();
    }
    else // Run through the data sent and send off the authentications to correct modules
    {
        for(let i = 0 ; i < data["type"].length; i++)
        {
            // if found array is empty or type received is not in the array
            if(foundTypes.length === 0 || foundTypes.indexOf(data["type"][i]) === -1)
            {
                // add new type to the array
                diffTypes++;
                foundTypes[foundTypes.length] = data["type"][i];
                logInfo("Received " + data["type"][i] + " data");
            }

            if(data["type"][i] === "PIN")
                pinFound = true;
            else if(data["type"][i] === "OTP")
                sess.waitingforOTP = true;
        }

        console.log("PIN found -> " + pinFound);
        console.log("Different types of authentication -> " + diffTypes + "\n");

        if((!pinFound && !sess.waitingforOTP) || diffTypes !== 2)
        {
            /*
            // No pin given which was required so throw notAuthenticatedException error
            request.on('error', (error) => {
                console.error('notAuthenticatedException' + error);
            });
            throw new Error("notAuthenticatedException");
             */

            j = JSON.parse('{ "success" : false, "data" : "Did not receive either a PIN or OTP."}');
            response.json(j);
            response.end();
            logResponse(response);
            return;
        }
        else
        {
            // Authenticate the given data
            let a;

             for(let i = 0; i < data["type"].length; i++)
            {
                for(var k = 0; k < methods.length; k++)
                {
                    if(data["type"][i] === methods[k])
                    {
                    var path = './' +  methods[k] + '.js';
                    var method = require(path);
                    options.hostname = method.returnhostname();
                    options.port = method.returnport();
                    options.path = method.returnpath();
                    options.method = method.returnmethod();
                    options.headers['Content-Type'] = method.returnCType();
                    options.headers['Content-Length'] = method.returnCLength();
                    data.data1 = method.returnData1();
                    data.data2 = method.returnData2();

                    a = sendAuthenticationRequest(options);
                    }


                }
            
            }
        }

        // If there's no pending OTP request, check the returned values for if the user was authenticated
        if(!sess.waitingforOTP)
        {
            let success = true;

            for(let i = 0; i < responses.length; i++)
            {
                if(responses[i] === "notAuthenticatedException")
                {
                    success = false;
                    break;
                }
            }

            if(success)
                j = JSON.parse('{ "success" : true, "data" : "someCustomerID"}');
            else
                j = JSON.parse('{ "success" : false, "data" : "notAuthenticatedException"}');

            console.log("Destroying session");

            //Destroy the session
            sess.destroy();
        }
        else
        {
            console.log("Waiting for OTP to be sent");

            j = JSON.parse('{ "success" : true, "data" : "Awaiting OTP"}');
        }

        console.log(j);
        logResponse(j);

        response.json(j);
        response.end();
    }
});

// --------------------------------------------------------------------------------------
// Get error
// --------------------------------------------------------------------------------------
app.get('*', function(req, res, next) {
    // res.render('error');
});

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