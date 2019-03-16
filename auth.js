// ======================================================================================
// Get the dependencies
// ======================================================================================

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const session = require('express-session');

// start express application
const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: false}));
app.use("/public", express.static(__dirname + "/public"));

// set view engine to ejs
app.set('view engine', 'ejs');

//To enable sessions
app.use(session({
    secret: 'yolo'
}));

// ======================================================================================
// Define the different classes
// ======================================================================================

// Abstract class for authentication method
class Authentication{

    // Initialize fields
    constructor(hostname, port, path, method, headers){

        this.hostname = hostname;
        this.port = port;
        this.path = path;
        this.method = method;
        this.headers = headers;
    }
}

// Classes that inherit from Authentication are the types of Authentication
class NFC extends Authentication{

    constructor(hostname, port, path, method, headers){
        super(hostname, port, path, method, headers);
    }
}

let nfc = new NFC(
    "NFC",
    443,
    "/todo",
    "POST",
    {
        'Content-Type': 'application/json' /*,
        'Content-Length': data.length*/
    }
);

class PIC extends Authentication{

    constructor(hostname, port, path, method, headers){
        super(hostname, port, path, method, headers);
    }
}

let pic = new PIC(
    "facial-recognition",
    443,
    "/todo",
    "POST",
    {
        'Content-Type': 'application/json'/*,
        'Content-Length': data.length*/
    }
);

class CID extends Authentication{

    constructor(hostname, port, path, method, headers){
        super(hostname, port, path, method, headers);
    }
}

let cid = new CID(
    "CID",
    443,
    "/todo",
    "POST",
    {
        'Content-Type': 'application/json'/*,
        'Content-Length': data.length*/
    }
);

class OTP extends Authentication{

    constructor(hostname, port, path, method, headers){
        super(hostname, port, path, method, headers);
    }
}

let otp = new OTP(
    "OTP",
    443,
    "/todo",
    "POST",
    {
        'Content-Type': 'application/json'/*,
        'Content-Length': data.length*/
    }
);

// class PIN extends Authentication{
//
//     constructor(hostname, port, path, method, headers){
//         super(hostname, port, path, method, headers);
//     }
// }

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

function sendAuthenticationRequest()
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
    console.log("Data will be sent to -> " + options);

    return "Data will be sent to -> " + options;
}

// ======================================================================================
// Application implementation
// ======================================================================================

let options = [];

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

// Declare sess here so that it keeps it's data between calls
let sess;

app.get('/authenticate', function(request, response)
{
    console.log("Authenticate on GET");

    // for browser
    // console.log(request.query);
    // let data = request.query;
    // for api

    let data = request.query;
    console.log(data);

    /*
     *  The only reason we'd extend a session over multiple connections is for:
     *      1) Counting number of tries the user has expended
     *      2) Awaiting an OTP authentication
     */

    // If the session is new then start new session.
    if(!sess)
    {
        sess = request.session;

        // If the bank didn't send an ID, throw an error
        if(!data["ID"])
        {
            j = JSON.parse('{ "success" : false, "data" : "No bank ID sent."}');
            response.json(j);
            response.end();

            return;
        }

        sess.bankID = data["ID"];

        console.log("\n===============================");
        console.log("New sessions with bank " + sess.bankID);
        console.log("===============================\n");
        console.log("Authentication from bank -> " + sess.bankID);

        // Store number of tries per request here
        sess.PICTries = 0;
        sess.PINTries = 0;
        sess.OTPTries = 0;
        sess.CIDTries = 0;
        sess.NFCTries = 0;
    }

    let pinFound = false;

    let diffTypes = 0;
    let foundTypes = [];
    let responses = [];
    let j;

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

        // Destroy session
        sess = null;
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
                writeLog("Received " + data["type"][i] + " data");
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

            return;
        }
        else
        {
            // Authenticate the given data
            let a;

            for(let i = 0; i < data["type"].length; i++)
            {
                if(data["type"][i] === "PIN" && sess.PINTries < 3)
                {
                    sess.PINTries++;

                    //Handle it here
                    console.log("Handling PIN");

                    a = "someCustomerID"; // Placeholder value
                }
                else if(data["type"][i] === "PIC" && sess.PICTries < 3)
                {
                    sess.PICTries++;
                    options = pic.hostname;

                    a = sendAuthenticationRequest(response);
                }
                else if(data["type"][i] === "NFC" && sess.NFCTries < 3)
                {
                    sess.NFCTries++;
                    options= nfc.hostname;

                    a = sendAuthenticationRequest(response);
                }
                else if(data["type"][i] === "CID" && sess.CIDTries < 3)
                {
                    sess.CIDTries++;
                    options = cid.hostname;

                    a = sendAuthenticationRequest(response);
                }
                else if(data["type"][i] === "OTP" && sess.OTPTries < 3)
                {
                    sess.OTPTries++;
                    options = otp.hostname;

                    a = sendAuthenticationRequest(response);
                }

                // If sendAuthenticationRequest() returns a failed signal
                if(a === "notAuthenticatedException")
                    responses[i] = "notAuthenticatedException";
                else
                    responses[i] = "someCustomerID"
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
            sess = null;
        }
        else
        {
            console.log("Waiting for OTP to be sent");

            j = JSON.parse('{ "success" : true, "data" : "Awaiting OTP"}');
        }

        console.log(j);

        response.json(j);
        response.end();
    }
});

// --------------------------------------------------------------------------------------
// Get error
// --------------------------------------------------------------------------------------
app.get('*', function(req, res, next) {
    res.render('error');
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
