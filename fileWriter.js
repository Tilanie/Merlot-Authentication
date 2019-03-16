var fs = require('fs');//File system 
exports.fileWrite = function(data ,name){

	var filename = "default"
	if(name != undefined)
		filename = name;
	fs.writeFile("authorizationMethods/"+filename+".js",data,function(err){
		if (err) 
	  		throw err;
  		console.log('Created new file: '+filename);
	})
}
