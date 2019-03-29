// ======================================================================================
// Get the dependencies
// ======================================================================================

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
var functionMaker = require("./authentication_types/functionMaker.js");
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


function sendAuthenticationRequest(options, callback)
{
    console.log("authentication function");
    const https = require('https');
    const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', (d) => {
        process.stdout.write(d);
        callback(d);
        })
    });

    req.on('error', (error) => {
        logError(error);
    });

    // Remove when actually testing
    var jsonData = JSON.parse('{ "Success" : true, "ClientID" : "123", "Timestamp" : "' + (new Date()).valueOf() + '"}');

    console.log("Calling callback with " + jsonData);
    callback(jsonData);
    //

    //var jsonData = JSON.parse(options.dataToSend);
    req.write(jsonData + "");
    req.end();
    logRequest(options);
}

function getATMResponse(success, ClientID, triesLeft)
{
    return JSON.parse('{ "Success" : "' + success + '", "ClientID" : "' + ClientID + '", "TriesLeft" : "' + triesLeft + '", "Timestamp" : "' + (new Date()).valueOf() + '"}')
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

fs.readFile('authentication_types/methods.json', (err, data) => {  
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
        fs.writeFileSync('authentication_types/methods.json', methodData);
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
  dataToSend : '', // Added this, so each module can have its request tailored if need be
  headers: {
    'Content-Type': 'application/json'
  }
}
// --------------------------------------------------------------------------------------
// Post authenticate
// --------------------------------------------------------------------------------------

app.post('/authenticate', function(request, response)
{

});

// --------------------------------------------------------------------------------------
// Get authenticate
// --------------------------------------------------------------------------------------


app.get('/authenticate', function(request, response)
{
    /* Receive either
      {
       "ID": 1,
       "type":
           [
           "type1",
           "type2"
           ],
      "data": [
           "data1",
           "data2"
           ]
      }
      OR
      {
       "ID": 1,
       "type":
           [
           "type"
           ],
      "data": [
           "data"
           ]
      }
     */

    let sess = request.session;

    // for browser
    // console.log(request.query);
    // let data = request.query;
    // for api

    let data = request.query; //change!!!!!!!
    console.log(data);

    // If the session is new then start new session.
    if(!sess.atmID)
    {
        // If the bank didn't send an ID, throw an error
        if(!data["ID"])
        {
            //j = JSON.parse('{ "Success" : false, "data" : "No bank ID sent."}');
            j = getATMResponse(false, "", 3 - sess.numTries)

            response.json(j);
            response.end();
            logWarning('Recieved no atm id');
            return;
        }

        sess.atmID = data["ID"];

        console.log("\n===============================");
        console.log("New sessions with bank " + sess.atmID);
        console.log(sess.id);
        console.log("===============================\n");

        // Store number of tries for authentication and number of successful authentications (For TFA)
        sess.numTries = 0;
        sess.numAuthenticated = 0;
        sess.usedMethods = [];
    }

    console.log("\nAuthenticate on GET from bank -> " + sess.atmID + "\n");

    let pinFound = false;
    let cardFound = false;
    let canIdentify = false;

    let diffTypes = 0;
    let foundTypes = [];
    let responses = [];

    let a;

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
            //j = JSON.parse('{ "Success" : false, "data" : "Expecting an OTP."}');
            j = getATMResponse(false, "", 3 - sess.numTries)

            console.log(j);

            response.json(j);
            response.end();

            return;
        }

        // Handle returning OTP request
        sess.usedMethods[sess.usedMethods.length] = "OTP";

        let path = './authentication_types/OTP.js';
        let method = require(path);
        options.hostname = method.returnhostname();
        options.port = method.returnport();
        options.path = method.returnpath();
        options.method = method.returnmethod();
        options.headers['Content-Type'] = method.returnCType();
        options.headers['Content-Length'] = method.returnCLength();

        /* Format to send to OTP for first request, so that they will generate an OTP and store it
            {
                "ClientID" : "...",
                "otp" : "",
                "status" : "",
                "statusMessage" : ""
            }
         */

        options.dataToSend = '{ "ClientID" : "' + sess.ClientID + '",' +
            '                "otp" : "' + data["data"][OTPFound] + '",' +
            '                "Success" : "",' +
            '                "statusMessage" : "" }';

        //setTimeout(responseFunction, 30000);

        sendAuthenticationRequest(options, responseFunction);

        sess.waitingforOTP = false;

        // Validate the sent OTP with the one that was generated in previous call

        responses[responses.length] = [];
        if(a["Success"])
        {
            responses[responses.length-1]["Success"] = true;
            responses[responses.length-1]["ClientID"] = "someClientID";
        }
        else
            responses[responses.length-1]["Success"] = false;

    }
    else
    {
        // Check what you already have, if the authentication was made over more than one call
        if(sess.usedMethods.indexOf("CID") !== -1)
            cardFound = true;

        if(sess.usedMethods.indexOf("CID") !== -1 || sess.usedMethods.indexOf("PIC") !== -1)
            canIdentify = true;

        // Run through the data sent and send off the authentications to correct modules
        for(let i = 0 ; i < data["type"].length; i++)
        {
            // if found array is empty or type received is not in the array
            if((foundTypes.length === 0 || foundTypes.indexOf(data["type"][i]) === -1) && sess.usedMethods.indexOf(data["type"][i]) === -1)
            {
                // add new type to the array
                diffTypes++;
                foundTypes[foundTypes.length] = data["type"][i];
                writeLog("Received " + data["type"][i] + " data");

                if(data["type"][i] === "PIN")
                    pinFound = true;
                else if(data["type"][i] === "CID")
                {
                    cardFound = true;
                    canIdentify = true;
                }
                else if(data["type"][i] === "PIC")
                    canIdentify = true;
            }
        }

        console.log("PIN found -> " + pinFound);
        console.log("CARD found -> " + cardFound);
        console.log("Different types of authentication -> " + diffTypes + "\n");

        // If you can't identify the client, then you can't authenticate them
        if(!canIdentify)
        {
            //j = JSON.parse('{ "Success" : false, "data" : "No way of identifying the client was given."}');
            j = getATMResponse(false, "", 3 - sess.numTries)

            console.log(j);

            response.json(j);
            response.end();

            return;
        }

        // If there's no authentication methods, then you can't authenticate the client
        if(diffTypes === 0)
        {
            //j = JSON.parse('{ "Success" : false, "data" : "No new authentication types were given."}');
            j = getATMResponse(false, "", 3 - sess.numTries)

            console.log(j);

            response.json(j);
            response.end();

            return;
        }

        // If only one type of authentication was given, then you can't authenticate
        if(data["type"].length === 2 && diffTypes !== 2)
        {
            //j = JSON.parse('{ "Success" : false, "data" : "Can\'t do TFA with the same form of authentication."}');
            j = getATMResponse(false, "", 3 - sess.numTries)

            console.log(j);

            response.json(j);
            response.end();

            sess.destroy();

            return;
        }

        // If a pin is found, then it needs to be associated with a card
        if(pinFound && !cardFound)
        {
            //j = JSON.parse('{ "Success" : false, "data" : "PIN can only be used with a card."}');
            j = getATMResponse(false, "", 3 - sess.numTries)

            console.log(j);

            response.json(j);
            response.end();

            return;
        }

        // Authenticate the given data
        // Callback function for sendAuthenticationRequest()

        var reqResponse;
        function responseFunction(a)
        {
            console.log(a);
            if(!a)
            {
                console.log("problem");
                a = JSON.parse('{ "Success" : false, "ClientID" : "" }');
            }
            else
            {
                console.log("all good");
            }

            responses[responses.length] = [];

            console.log("Added success try");

            console.log("Succes -> " + a["Success"]);
            
            responses[responses.length-1]["Success"] = a["Success"]; // Success response
            responses[responses.length-1]["ClientID"] = a["ClientID"]; // Customer ID

            sess.ClientID = a["ClientID"];
        }

        for(let i = 0; i < data["type"].length; i++)
        {
            for(let k = 0; k < methods.length; k++)
            {
                if(data["type"][i] === methods[k])
                {
                    if(data["type"][i] !== "OTP")
                    {
                        //sess.usedMethods[sess.usedMethods.length] = data["type"][i];

                        let path = './authentication_types/' +  methods[k] + '.js';
                        let method = require(path);
                        options.hostname = method.returnhostname();
                        options.port = method.returnport();
                        options.path = method.returnpath();
                        options.method = method.returnmethod();
                        options.headers['Content-Type'] = method.returnCType();
                        options.headers['Content-Length'] = method.returnCLength();

                        /* Default format for data, I'm just taking a guess with this, change it if needed
                            {
                                "data" : "data["data"][i]"
                            }
                         */

                        options.dataToSend = '{ "data" : "' + data["data"][i] + '" }';

                        //setTimeout(responseFunction, 30000);

                        sendAuthenticationRequest(options, responseFunction);
                    }
                    else
                    {
                        console.log("Received OTP call from ATM" + sess.atmID + "!");
                        sess.waitingforOTP = true;
                    }
                }
            }
        }
    }

    if(sess.waitingforOTP === true)
    {
        sess.usedMethods[sess.usedMethods.length] = "OTP";

        let path = './authentication_types/OTP.js';
        let method = require(path);
        options.hostname = method.returnhostname();
        options.port = method.returnport();
        options.path = method.returnpath();
        options.method = method.returnmethod();
        options.headers['Content-Type'] = method.returnCType();
        options.headers['Content-Length'] = method.returnCLength();

        /* Format to send to OTP for first request, so that they will generate an OTP and store it
            {
                "ClientID" : "...",
                "otp" : "",
                "status" : "",
                "statusMessage" : ""
            }
         */

        options.dataToSend = '{ "ClientID" : "' + sess.ClientID + '",' +
            '                "otp" : "",' +
            '                "Success" : "",' +
            '                "statusMessage" : "" }';

        ////setTimeout(responseFunction, 30000);

        sendAuthenticationRequest(options, responseFunction);
    }

    // Count the number of authentications that succeeded and that failed
    let success = true;
    let ClientID = "";

    for(let i = 0; i < responses.length; i++)
    {
        if(responses[i]["Success"] === false)
        {
            success = false;
            sess.numTries++;

            break;
        }
        else if(responses[i]["Success"] === true)
        {
            ClientID = responses[i]["ClientID"];
            sess.numAuthenticated++;
        }
    }

    console.log("Session numAuthenticated -> " + sess.numAuthenticated);

    // If 2 or more succeeded
    if(success && sess.numAuthenticated >= 2)
        sess.ClientID = ClientID;
    else if(sess.waitingforOTP === true)
    {
        //j = JSON.parse('{ "Success" : false, "data" : "awaiting for OTP confirmation."}');
        j = getATMResponse(false, "", 3 - sess.numTries)
    }
    else
    {
        //j = JSON.parse('{ "Success" : false, "data" : "awaiting for more authentication for TFA."}');
        j = getATMResponse(false, "", 3 - sess.numTries)
    }

    if(sess.numAuthenticated >= 2)
    {
        //j = JSON.parse('{ "Success" : true, "data" : "' + sess.ClientID + '"}');
        j = getATMResponse(true, sess.ClientID, 3 - sess.numTries)

        console.log("Destroying session");
        //Destroy the session
        sess.destroy();
    }
    else if(sess.numTries >= 3)
    {
        //j = JSON.parse('{ "Success" : false, "data" : "notAuthenticatedException"}');
        j = getATMResponse(false, "", 0)

        console.log("Number of tries exceeded specified amount. This customer has been blocked.");

        // TODO: Block the customer

        console.log("Destroying session");
        //Destroy the session
        sess.destroy();
    }

    console.log(j);

    response.json(j);
    response.end();
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