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
    return "https://merlot-facial-recognition.herokuapp.com";
  },
  returnport : function()
  {
  	return 8000;
  },
  returnpath : function()
  {
  	return "";
  },
  returnmethod : function()
  {
  	return "POST";
  }
};