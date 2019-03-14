var assert = require('chai').assert;
const auth = require('../auth');

describe('auth', function () 
{
  //This is an example of a functions unit test
  //The describe block creates a category for the tessted function
  describe('sayHello()', function()
  {
    //Get function output
    sayHelloResult = auth.sayHello();

    //Each it block is a test for the function
    it('Should return a string', function()
    {
      assert.typeOf(sayHelloResult, 'string');
    });

    it('Should return "hello"', function () 
    {
      assert.equal(sayHelloResult, "hello");
    });
  });
  /*
  describe('sendAuthenticationRequest()', function()
  {
    authenticationRequestResult = auth.sendAuthenticationRequest();

    it('Should return a string', function()
    {
      assert.typeOf(authenticationRequestResult, 'string');
    });
  });
  */
});