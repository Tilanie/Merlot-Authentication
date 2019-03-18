
var f = require("./fileWriter.js")
exports.CreateFunction = function(input){
	var DefaultFName = "Auth";
	var DefaultFName = Math.floor((Math.random() * 1000000) + 1);;
	// {
	// methodname: 'METH'
 //  hostname: 'flaviocopes.com',
 //  port: 443,
 //  path: '/todos',
 //  method: 'POST',
 //  headers: {
 //    'Content-Type': 'application/json',
 //    'Content-Length': 1
 //  }
	var toWrite = "module.exports = {" + " returnhostname: function () { return" + "\"" + input.hostname + "\"" +";}," + 
	" returnport: function () { return "  + input.port +";}," +
	" returnpath: function () { return " + "\"" + input.path + "\"" +";}," + 
	" returnmethod: function () { return " + "\"" + input.method + "\"" +";}," + 
	" returnCType: function () { return "   + "\"" + input.Ctype  + "\"" + ";}," +
	" returnCLength: function () { return "  + input.Clength +";}, };";
  

	f.fileWrite(toWrite,input.methodname);
}
