var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
const https = require('https')
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));

var PORT = 3000;

var options = [];

app.post('/authenticate',function(request,response)
{
   console.log("Authenticate on POST");
   var type = request.body.type;
   var data = request.body.data;

});

app.get('/authenticate',function(request, response)
{
   console.log("Authenticate on GET");

   var data = request.body;

   /* Can receive:
    * PIN -- 3
    * PIC -- 2
    * NFC -- 1
    * CID -- 0
    */

   // Didn't send through the two items needed, so authenticate one and prompt for a pin

   // Identify what was sent

      /* Array we receive
//       *  {
//     "type": [
//         "PIN",
//         "CID"
//     ],
//     "data": [
//         123,
//       456
//     ]
// }
      */
   // 3 authentication options, for Facial, NFC and OTP
   let AuthOptions = [
         {
         "hostname": 'facial-path',
         "port": 443,
         "path": '/todos',
         "method": 'POST',
         "headers": {
            'Content-Type': 'application/json',
            'Content-Length': data.length
            }
      },
         {
         "hostname": 'NFC-path',
         "port": 443,
         "path": '/todos',
         "method": 'POST',
         "headers": {
            'Content-Type': 'application/json',
            'Content-Length': data.length
            }
      },
         {
         "hostname": 'OTP-path',
         "port": 443,
         "path": '/todos',
         "method": 'POST',
         "headers": {
            'Content-Type': 'application/json',
            'Content-Length': data.length
            }
      }
   ];

   let pinFound = false;

   let diffTypes = 0;
   let foundTypes = [];
   for(let i = 0; i < data["type"].length; i++)
   {
      if(foundTypes.length === 0 || foundTypes.indexOf(data["type"][i]) === -1)
      {
         diffTypes++;
         foundTypes[foundTypes.length] = data["type"][i];
      }

      if(data["type"][i] === "PIN")
         pinFound = true;
   }

   console.log(pinFound);
   console.log(diffTypes);

   if(!pinFound || diffTypes !== 2)
   {
      // No pin given which was required so throow notAuthenticatedException error
      request.on('error', (error) => {
         console.error('notAuthenticatedException' + error);
      });

      throw new Error("notAuthenticatedException");
   }
   else
   {
      // Authenticate the given data
      let NFCCount = 0;
      let PICCount = 0;
      let CIDCount = 0;
      let PINCount = 0;

      response.write("<!DOCTYPE html>" +
          "<html lang='en'>" +
          "<head>\n" +
          "        <meta charset='UTF-8'>\n" +
          "        <title>Response</title>\n" +
          "\n" +
          "        <style>\n" +
          "            /* The alert message box */\n" +
          "            .alert {\n" +
          "                padding: 20px;\n" +
          "                background-color: #f4ed47; /* Red */\n" +
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
            options = AuthOptions[0]["hostname"];

            sendAuthenticationRequest(response);
         }
         else if(data["type"][i] === "NFC" && NFCCount < 3)
         {
            NFCCount++;
            options = AuthOptions[1]["hostname"];

            sendAuthenticationRequest(response);
         }
         else if(data["type"][i] === "CID" && CIDCount < 3)
         {
            CIDCount++;
            //options = "CID";
            options = AuthOptions[2]["hostname"];

            sendAuthenticationRequest(response);
         }
      }

      response.write("</span>\n" +
          "        </div>" +
          "    </body>" +
          "</html>");

      response.end();
   }
});

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

   //Log to file
   writeLog(options);

   response.write(options + "<br>");
}

function writeLog(message)
{
	if (!fs.existsSync("Logs"))
	{
    		fs.mkdirSync("Logs");
	}	
	fs.writeFile("Logs/log.txt"
		    ,new Date() + " " + message + "\n"
		    ,{'flag':'a'}
		    ,function(err) 
		     {
    			if(err) 
			{
        			return console.log(err);
    		     	}
		     }); 
}

app.listen(PORT);
console.log("Server is running on port " + PORT);
