module.exports = {
  returnCType: function()
  {
    return 'application/json';
  },
  returnCLength: function()
  {
    return 1;
  },
  returnhostname: function () {
    return "otp.pathname";
  },
  returnport : function()
  {
  	return 8000;
  },
  returnpath : function()
  {
  	return "/todos";
  },
  returnmethod : function()
  {
  	return "GET";
  }
};