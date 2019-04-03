// ======================================================================================
// Get the dependencies
// ======================================================================================

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const functionMaker = require("./authentication_types/functionMaker.js");
const session = require('express-session');
const uuid = require('uuid/v4');
const https = require('https');
const rp = require('request-promise');

// start express application
const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: false}));

// use sessions in the application
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
//Core logging function
function writeLog(mesg, type, success, cardID, cardType, clientID)
{
    if (!fs.existsSync(__dirname + '/logs')) 
    {
        fs.mkdirSync(__dirname + '/logs', 0o744);
    }

    var logEntry = 
    {
        "logType" : type,
        "cardID" : cardID,
        "cardType" : cardType,
        "clientID" : clientID,
        "description" : mesg,
        "success" : success,
        "timestamp" : (new Date()).valueOf()
    };

    fs.appendFile('logs/log.txt', JSON.stringify(logEntry) + '\n', function (err)
    {
        if (err) throw err;
    });

    fs.stat('logs/log.txt', function (err, stats) 
    {
        if(stats.size > 10000) //Log greater than 10 KB
        {
            //Rename file to enable logging to continue
            fs.rename('logs/log.txt', 'logs/log.json', function(err) 
            {
                if ( err ) console.log('ERROR: ' + err);
            });

            //Read in file and send to the reporting team
            logInfo("Log size limit reached, sending log to reporting subsystem", -1, "N/A", -1);


        }
    });
}

//Logging functions (Please use these rather than the core logging function)
function logInfo(mesg, cardID, cardType, clientID)
{
    writeLog(mesg, 'info', true, cardID, cardType, clientID);
}

function logWarning(mesg, cardID, cardType, clientID)
{
    writeLog(mesg, 'warn', false, cardID, cardType, clientID);
}

function logError(mesg, cardID, cardType, clientID)
{
    writeLog(mesg, 'error', false, cardID, cardType, clientID);
}

function logRequest(mesg, cardID, cardType, clientID)
{
    writeLog(mesg, 'request', true, cardID, cardType, clientID);
}

function logResponse(mesg, cardID, cardType, clientID)
{
    writeLog(mesg, 'response', true, cardID, cardType, clientID);
}

// send an authentication request
async function sendAuthenticationRequest(options, callback)
{
    let url = options.hostname + options.path;

    let optionsToSend = {
        method: 'POST',
        uri: url,
        body: JSON.parse(options.dataToSend),
        json: true
    };

    console.log("Sending request to -> " + url + " \nwith data:");
    console.log(options.dataToSend);

    logRequest(optionsToSend, -1, "N/A", -1);

    return await rp(optionsToSend)
            .then(function(parseBody) {
                console.log(parseBody);
                callback(parseBody);
            })
            .catch(function(error) {
                console.log(error);
            });
}

function getATMResponse(success, ClientID, triesLeft)
{
    return JSON.parse('{ "Success" : "' + success + '", "ClientID" : "' + ClientID + '", "TriesLeft" : "' + triesLeft + '", "Timestamp" : "' + (new Date()).valueOf() + '"}');
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

app.post("/newMethod",async function(req,res){
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
        logError("Mehod adding failed", -1, "N/A", -1);
        res.json(JSON.parse("{ 'status': 'Failed', 'message':'Something went wrong check the server' }"));      
        res.end();
    }
});

// --------------------------------------------------------------------------------------
// Request Structure
// --------------------------------------------------------------------------------------
let j;

const options = {
  hostname: 'flaviocopes.com',
  port: 443,
  path: '/todos',
  method: 'POST',
  dataToSend : '', // Added this, so each module can have its request tailored if need be
  headers: {
    'Content-Type': 'application/json'
  }
};

// --------------------------------------------------------------------------------------
// Post authenticate
// --------------------------------------------------------------------------------------
app.get('/display', function(request, response)
{ 
   var displayData = {
    "CID": [
        "PIN",
        "OTP",
        "PIC"
    ],
    "PIC": [
        "PIN",
        "OTP",
        "CID"
     ]
    };

    console.log(displayData);

    response.json(displayData);
    response.end();

});

// --------------------------------------------------------------------------------------
// Get authenticate
// --------------------------------------------------------------------------------------
app.post('/authenticate', async function(request, response)
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
    logRequest("Received authentication request: " + request.body, -1, "N/A", -1);
    let sess = request.session;

    let data = request.body;
    // debug msg
    console.log(data);

    // If the session is new then start new session.
    if(!sess.atmID)
    {
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

    // debug msg
    console.log("\nAuthenticate on GET from bank -> " + sess.atmID + "\n");

    let pinFound = false;
    let cardFound = false;
    let canIdentify = false;

    let diffTypes = 0;
    let foundTypes = [];
    let responses = [];

    // Callback function for sendAuthenticationRequest()
    async function responseFunction(a)
    {
        if(!a)
        {
            console.log("problem");
            a = JSON.parse('{ "Success" : false, "ClientID" : "" }');
        }

        responses[responses.length] = [];

        responses[responses.length-1]["Success"] = a["Success"];    // Success response

        responses[responses.length-1]["ClientID"] = a["ClientID"];  // Customer ID
        
        sess.ClientID = responses[responses.length-1]["ClientID"];
    }

    // If it is a returning OTP request, handle it
    if(sess.waitingforOTP)
    {
        //Look through the given types for a OTP
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
            j = getATMResponse(false, "", 3 - sess.numTries);

            // debug msg
            console.log(j);

            response.json(j);
            response.end();

            return;
        }

        // Handle returning OTP request
        let path = './authentication_types/OTP.js';
        let method = require(path);
        options.hostname = method.returnhostname();
        options.port = method.returnport();
        options.path = method.returnpath();
        options.method = method.returnmethod();
        options.headers['Content-Type'] = method.returnCType();
        options.headers['Content-Length'] = method.returnCLength();

        /* Format to send to OTP for second request, so that they can verify the OTP
            {
                "ClientID" : "XYZ",
                "type" : "validate",
                "pin": "xyz"
            }
         */

        options.dataToSend = '{ "ClientID": "' + sess.ClientID + '",' +
                             '  "type": "validate",' +
                             '  "pin": "' + data["data"][OTPFound] +'"}';

        await sendAuthenticationRequest(options, responseFunction);

        // debug msg
        console.log("Handling returning OTP call...");

        if(responses[responses.length-1]["Success"] == 'true' || responses[responses.length-1]["Success"] == true)
            sess.waitingforOTP = false;
        else
            sess.waitingforOTP = true;

        console.log("sess.waitingForOTP = " + sess.waitingforOTP);
        // If the OTP didn't work, increment number of tries
        if(sess.waitingforOTP)
            sess.numTries++;
        else
            sess.usedMethods[sess.usedMethods.length] = "OTP";
    }
    else
    {
        // Check what you already have since the authentication could've been made over more than one call
        if(sess.usedMethods.indexOf("CID") !== -1 || sess.usedMethods.indexOf("NFC") !== -1)
            cardFound = true;

        if(sess.usedMethods.indexOf("CID") !== -1 || sess.usedMethods.indexOf("PIC") !== -1 || sess.usedMethods.indexOf("NFC") !== -1)
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
                logInfo("Found type " + data["type"][i], data["data"][i], "N/A", sess.ClientID);

                if(data["type"][i] === "PIN")
                    pinFound = true;
                else if(data["type"][i] === "CID" || data["type"][i] === "NFC")
                {
                    cardFound = true;
                    canIdentify = true;
                }
                else if(data["type"][i] === "PIC")
                    canIdentify = true;
            }
        }

        // If you can't identify the client OR
        // No types were given OR
        // A pin was found without a card
        // Then you can't authenticate them
        if(!canIdentify || diffTypes === 0 || (pinFound && !cardFound))
        {
            j = getATMResponse(false, "", 3 - sess.numTries);

            // debug msg
            console.log(j);

            response.json(j);
            response.end();

            if((data["type"].length === 2 && diffTypes !== 2))
                sess.destroy();

            return;
        }

        // If the PIN is at index 0 and the length is greater than 1, then we know since we reached here that the card must be at index 1, so swap the two
        if(data["type"][0] === "PIN" && data["type"].length > 1)
        {
            let temp = data["data"][0];
            data["data"][0] = data["data"][1];
            data["data"][1] = temp;

            temp = data["type"][0];
            data["type"][0] = data["type"][1];
            data["type"][1] = temp;

            sess.cardID = data["type"][0];
        }

        // If the OTP is at index 0 and the length is greater than 1, then we know since we reached here that the identification method must be at index 1, so swap the two
        if(data["type"][0] === "OTP" && data["type"].length > 1)
        {
            let temp = data["data"][0];
            data["data"][0] = data["data"][1];
            data["data"][1] = temp;

            temp = data["type"][0];
            data["type"][0] = data["type"][1];
            data["type"][1] = temp;

            sess.cardID = data["type"][0];
        }

        // Authenticate the given data
        for(let i = 0; i < data["type"].length; i++)
        {
            for(let k = 0; k < methods.length; k++)
            {
                if(data["type"][i] === methods[k])
                {
                    let path = './authentication_types/' +  methods[k] + '.js';
                    let method = require(path);
                    options.hostname = method.returnhostname();
                    options.port = method.returnport();
                    options.path = method.returnpath();
                    options.method = method.returnmethod();
                    options.headers['Content-Type'] = method.returnCType();
                    options.headers['Content-Length'] = method.returnCLength();

                    if(data["type"][i] === "OTP")
                    {
                        // debug msg
                        console.log("Received OTP call from ATM" + sess.atmID + "!");
                        sess.waitingforOTP = true;

                        /* Format to send to OTP for first request, so that they will generate an OTP and store it
                            {
                                "ClientID" : "XYZ",
                                "type" : "generate"
                            }
                         */

                        options.dataToSend = '{ "ClientID":"' + sess.ClientID + '",' +
                                             '"type": "generate"}';
                    }
                    else if(data["type"][i] === "PIC")
                    {
                        /*
                            {
                                "type": "authenticate"
                                "image": "base64Image"
                            }
                         */
                        options.dataToSend = '{ "type": "authenticate",' +
                            '"image": "' + data["data"][i] + '"}';

                    }
                    else if(data["type"][i] === "NFC" || data["type"][i] === "CID")
                    {
                        sess.cardID = data["data"][i];
                        /*
                            {
                                "cardID": "XYZ"
                            }
                         */
                        options.dataToSend = '{ "cardID": "' + data["data"][i] + '"}';
                    }
                    else if(data["type"][i] === "PIN")
                    {
                        /*
                            {
                                "cardID": "XYZ",
                                "pin": "xzy"
                            }
                         */
                        console.log("Here");
                        options.dataToSend = '{ "cardID": "' + sess.cardID  + '",' +
                            '"pin": "' + data["data"][i] + '"}';
                    }
                    else
                    {
                        /*
                            {
                                "data" : "XYZ"
                            }
                         */
                        options.dataToSend = '{ "data" : "' + data["data"][i] + '" }';
                    }

                    await sendAuthenticationRequest(options, responseFunction);

                    if(responses[responses.length-1]["Success"] == 'true' || responses[responses.length-1]["Success"] == true)
                        sess.usedMethods[sess.usedMethods.length] = data["type"][i];
                }
            }
        }
    }

    // Count the number of authentications that succeeded and that failed
    let success = true;
    
    console.log(sess.ClientID);

    for(let i = 0; i < responses.length; i++)
    {
        console.log(responses[i]);
        if(responses[i]["Success"] == 'false' || responses[i]["Success"] == 'false')
        {
            success = false;
            sess.numTries++;

            break;
        }
        else if(responses[i]["Success"] == 'true' || responses[i]["Success"] == true)
        {
            sess.numAuthenticated++;
            if(responses[i]["ClientID"])
            {
                sess.ClientID = responses[i]["ClientID"];
            }
            else if(responses[i]["ClientID"] && sess.ClientID && toString(sess.ClientID) != toString(responses[i]["ClientID"]))
            {
                console.log("Sess.ClientID: " + sess.clientID + " != " + responses[i]["ClientID"]);
                sess.numAuthenticated--;
            }
        }
    }

    if(sess.waitingforOTP)
        sess.numAuthenticated--;

    console.log("Client ID in sess -> " + sess.ClientID)

    // debug msg
    console.log("Session numAuthenticated -> " + sess.numAuthenticated + "\n");

    // if waiting for OTP
    if(sess.waitingforOTP === true)
    {
        j = getATMResponse(false, "", 3 - sess.numTries)
    }
    else
    {
        j = getATMResponse(false, "", 3 - sess.numTries)
    }

    // if succeeded
    if(sess.numAuthenticated >= 2)
    {
        j = getATMResponse(true, sess.ClientID, 3 - sess.numTries)

        // debug msg
        console.log("Destroying session");
        //Destroy the session
        sess.destroy();

        logInfo("Session destroyed", -1, "N/A", sess.ClientID);
    }
    // if ran our of tries
    else if(sess.numTries >= 3)
    {
        j = getATMResponse(false, sess.ClientID, 0)

        console.log("Number of tries exceeded specified amount. This customer has been blocked.");
        logInfo("Customer exceeded number of authentication attempts. Account suspended.", -1, "N/A", sess.ClientID);

        if(ClientID !== ""){
            // send post request to block current user
            options.hostname = "http://merlotcisg7.herokuapp.com/";
            options.path = "/";
            options.method = "POST";
            options.headers['Content-Type'] = "application/json";

            options.dataToSend = '{' +
                '  "option": "deactivate"' +
                '  "clientId": "' + sess.ClientID + '",' +
                '}';

            await sendAuthenticationRequest(options, responseFunction);
        }

        // debug msg
        console.log("Destroying session");
        //Destroy the session
        sess.destroy();
    }

    // debug msg
    console.log(j);

    response.json(j);
    response.end();
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

app.listen(port, function () {
    console.log("Server is running at " + port);
});
