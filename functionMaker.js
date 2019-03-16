
var f = require("./fileWriter.js")
exports.CreateFunction = function(input){
	var DefaultFName = "Auth";
	var DefaultFName = Math.floor((Math.random() * 1000000) + 1);;

	f.fileWrite(input.Code,DefaultFName);
}
