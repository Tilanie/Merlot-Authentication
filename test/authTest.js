const assert = require('chai').assert;
const request = require('request');
const nock = require('nock');
const auth = require('../auth');

describe('auth', function () 
{
  
  describe('Resonse to GET authorization requests', function()
  {
    it('Response with PIN and PIC types', function() 
    {
      var respon = "";
      request.get({
        headers: { 'Content-Type': 'application/json' },
        url: 'http://merlot-auth.herokuapp.com/authenticate',
        qs: '{"type": ["PIC","PIN"],"data": [123,456], "ID":1}'
      }, function(error, response, body)
      {
            if(error)
              throw error;

            console.log(body);
            respon = body;
      });
   
      assert.equal('{"success": true,"data": "someCustomerID"}', respon);
    });
  });
});