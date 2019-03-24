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
    return "nfc.pathname";
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