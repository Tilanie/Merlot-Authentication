// ======================================================================================
// Get the dependencies
// ======================================================================================

const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

// start express application
const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: false}));

// set view engine to ejs
app.set('view engine', 'ejs');

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
// Application implementation
// ======================================================================================

let options = [];

// --------------------------------------------------------------------------------------
// Post method
// --------------------------------------------------------------------------------------
app.post('/authenticate',function(request,response)
{
    response.header("Access-Control-Allow-Origin", "*");

    console.log("Authenticate on POST");
    let type = request.body.type;
    let data = request.body.data;

    response.end();
});

// --------------------------------------------------------------------------------------
// Get method
// --------------------------------------------------------------------------------------
app.get('/authenticate', function(request, response)
{
    response.header("Access-Control-Allow-Origin", "*");

    console.log("Authenticate on GET");

    console.log(request.query);
    let data = request.query;

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

        /*
        response.write("<!DOCTYPE html>" +
            "<html lang='en'>" +
            "<head>\n" +
            "        <meta charset='UTF-8'>\n" +
            "        <title>Response</title>\n" +
            "\n" +
            "        <style>\n" +
            "           \n" +
            "            .alert {\n" +
            "                padding: 20px;\n" +
            "                background-color: #f4ed47;\n" +
            "                color: #000000;\n" +
            "                margin-bottom: 15px;\n" +
            "                transition: opacity 0.6s;\n" +
            "                width: 20%;" +
            "                margin-left: 40%;" +
            "            }\n" +
            "           a { text-decoration: none }" +
            "        </style>\n" +
            "</head>\n" +
            "    <body>\n<!-- Alert box -->\n" +
            "        <div class='alert' style='margin-top: 40px' id='alert'>\n" +
            "            <span id='alertText'>Sending data to -> ");
        */

        for(let i = 0; i < data["type"].length; i++)
        {
            if(data["type"][i] === "PIN" && PINCount < 3)
            {
                PINCount++;
                //Handle it here

            }
            else if(data["type"][i] === "PIC" && PICCount < 3)
            {
                PICCount++;
                options = pic.hostname;

                sendAuthenticationRequest(response);
            }
            else if(data["type"][i] === "NFC" && NFCCount < 3)
            {
                NFCCount++;
                options= nfc.hostname;

                sendAuthenticationRequest(response);
            }
            else if(data["type"][i] === "CID" && CIDCount < 3)
            {
                CIDCount++;
                options = cid.hostname;

                sendAuthenticationRequest(response);
            }
            else if(data["type"][i] === "OTP" && OTPCount < 3)
            {
                OTPCount++;
                options = otp.hostname;

                sendAuthenticationRequest(response);
            }
        }

        /*
        response.write("</span>\n" +
            "        </div>" +
            "    </body>" +
            "</html>");
        */
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