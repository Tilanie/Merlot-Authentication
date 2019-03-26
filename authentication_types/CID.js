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
    return "https://merlot-card-authentication.herokuapp.com";
  },
  returnport : function()
  {
  	return 3000;
  },
  returnpath : function()
  {
  	return "/authenticateNFC";
  },
  returnmethod : function()
  {
  	return "GET";
  },
  returnData1: function()
  {
    return "data1";
  },
  returnData2: function()
  {
    return "data2";
  }
};