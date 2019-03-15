const assert = require('chai').assert;
const request = require('request');
const nock = require('nock');
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
  
  describe('Resonse to GET authorization requests', function()
  {
    it('Response with PIN and PIC types', function() 
    {
      //nock('http://127.0.0.1:8000')
      //  .get('/authenticate')
      //  .reply(200, 'dataArray')
      var respon = "";
      request.get({
        url: 'http://127.0.0.1:8001/authenticate',
         body: '"type": ["PIC","PIN"],"data": [123,456]'
         }, function(error, response, body){
            console.log(body);
            respon = body;
      });
   
      assert.equal(respon, 'blah');
    });
  });
});