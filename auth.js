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

function sayHello()
{
    return 'hello';
}

function writeLog(logMessage)
{
    if (!fs.existsSync(__dirname + '/logs')) {
        fs.mkdirSync(__dirname + '/logs', 0o744);
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
};

function sendAuthenticationRequest(response)
{
    
    console.log(options);
    return JSON.parse('{ "success" : true, "data" : "Will be sent to -> ' + options.hostname + '"}');
    
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
    try
    {
        console.log("new function creating");
        let data = req.body;

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
    }
    catch(error)
    {
        console.log(error);

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

var options = {
  hostname: 'flaviocopes.com',
  port: 443,
  path: '/todos',
  method: 'POST',
  contentType: 'application/json',
  contentLength: 1
  
};

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

    /*
     *  The only reason we'd extend a session over multiple connections is for:
     *      1) Counting number of tries the user has expended
     *      2) Awaiting an OTP authentication
     */

    // If the session is new then start new session.
    if(!sess.atmID)
    {
        // If the bank didn't send an ID, throw an error
        if(!data["ID"])
        {
           j = JSON.parse('{ "success" : false, "data" : "No bank ID sent."}');
            response.json(j);
            response.end();

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

            console.log(j);

            response.json(j);
            response.end();

            return;
        }

        // Handle returning OTP request
        console.log("Received OTP, handling...");

        sess.waitingforOTP = false;

        // Validate the sent OTP with the one that was generated in previous call
        // TODO: either send OTP to OTP module or authenticate it against stored OTP returned from OTP module

        let success = true;

        responses[responses.length] = [];
        if(success)
        {
            responses[responses.length-1]["success"] = "true";
            responses[responses.length-1]["customerID"] = "someCustomerID";
        }
        else
            responses[responses.length-1]["success"] = "false";

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
            j = JSON.parse('{ "success" : false, "data" : "No way of identifying the client was given."}');

            console.log(j);

            response.json(j);
            response.end();

            return;
        }

        // If there's no authentication methods, then you can't authenticate the client
        if(diffTypes === 0)
        {
            j = JSON.parse('{ "success" : false, "data" : "No new authentication types were given."}');

            console.log(j);

            response.json(j);
            response.end();

            return;
        }

        // If only one type of authentication was given, then you can't authenticate
        if(data["type"].length === 2 && diffTypes !== 2)
        {
            j = JSON.parse('{ "success" : false, "data" : "Can\'t do TFA with the same form of authentication."}');

            console.log(j);

            response.json(j);
            response.end();

            sess.destroy();

            return;
        }
        // If a pin is found, then it needs to be associated with a card
        else if(pinFound && !cardFound)
        {
            j = JSON.parse('{ "success" : false, "data" : "PIN can only be used with a card."}');

            console.log(j);

            response.json(j);
            response.end();

            return;
        }
        else
        {
            // Authenticate the given data
            let a = [];

            for(let i = 0; i < data["type"].length; i++)
            {
                for(let k = 0; k < methods.length; k++)
                {
                    if(data["type"][i] === methods[k])
                    {
                        sess.usedMethods[sess.usedMethods.length] = data["type"][i];

                        /*
                        let path = './' +  methods[k] + '.js';
                        let method = require(path);

                        // TODO: Send data along with the call??

                        options.hostname = method.returnhostname();
                        options.port = method.returnport();
                        options.path = method.returnpath();
                        options.method = method.returnmethod();
                        options.contentType = method.returnCType();
                        options.contentLength = method.returnCLength();

                        a = sendAuthenticationRequest(response);
                        */

                        console.log("Sending data to -> " + methods[k]);

                        a = JSON.parse('{ "success" : true, "customerID" : "someCustomerID" }');

                        if(methods[k] === "OTP")
                        {
                            console.log("Received OTP call from ATM" + sess.atmID + "!");
                            sess.waitingforOTP = true;
                        }
                        else
                        {
                            responses[responses.length] = [];

                            responses[responses.length-1]["success"] = a["success"]; // Success response
                            responses[responses.length-1]["customerID"] = a["customerID"]; // Customer ID

                            sess.customerID = a["customerID"];
                        }
                    }
                }

            }
        }
    }

    // Count the number of authentications that succeeded and that failed
    let success = true;
    let customerID = "";

    for(let i = 0; i < responses.length; i++)
    {
        if(responses[i]["success"] === "false")
        {
            success = false;
            sess.numTries++;

            break;
        }
        else
        {
            customerID = responses[i]["customerID"];
            sess.numAuthenticated++;
        }
    }

    // If 2 or more succeeded
    if(success && sess.numAuthenticated >= 2)
        sess.customerID = customerID;
    else if(sess.waitingforOTP === true)
        j = JSON.parse('{ "success" : false, "data" : "awaiting for OTP confirmation."}');
    else
        j = JSON.parse('{ "success" : false, "data" : "awaiting for more authentication for TFA."}');

    if(sess.numAuthenticated >= 2)
    {
        j = JSON.parse('{ "success" : true, "data" : "' + sess.customerID + '"}');

        console.log("Destroying session");
        //Destroy the session
        sess.destroy();
    }
    else if(sess.numTries >= 3)
    {
        j = JSON.parse('{ "success" : false, "data" : "notAuthenticatedException"}');

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
