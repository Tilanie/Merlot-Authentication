let chai = require('chai');
let mocha = require('mocha');
let chaiHttp = require('chai-http');
let server = require('../auth');
let should = chai.should();


chai.use(chaiHttp);
  /*
  * Test the /POST route
  */
describe('Responses', () => {
  it('responds (code 200)', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC","PIN"],"data": [123,456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('is a JSON object', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC","PIN"],"data": [123,456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body.should.be.an('object');    
                  done();
                }
            });
  });

  it('contains correct attributes', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC","PIN"],"data": [123,456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body.should.have.property("Success");
                  response.body.should.have.property("ClientID");
                  response.body.should.have.property("TriesLeft");
                  response.body.should.have.property("Timestamp");  
                  done();
                }
            });
  });
});

describe('/authenticate with PIN', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIN"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('did not authenticate', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIN"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("");
                  done();
                }
            });
  });
});

describe('/authenticate with incorrect PIC', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('did not authenticate', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("");
                  done();
                }
            });
  });

  it('correctly keeps track of tries left', function(done) 
  {
    //First request
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["TriesLeft"].should.equal("2");
                }
            });
    
    //Second request
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["TriesLeft"].should.equal("2");
                  done();
                }
            });
  });
});

describe('/authenticate with correct PIC', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('did not authenticate', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("true");
                  response.body["ClientID"].should.equal("DummyID");
                  done();
                }
            });
  });
});

describe('/authenticate with OTP', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["OTP"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('did not authenticate', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["OTP"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("");
                  done();
                }
            });
  });
});

describe('/authenticate with correct NFC', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["NFC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('does not authenticate', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["NFC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("");
                  done();
                }
            });
  });
});

describe('/authenticate with incorrect NFC', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["NFC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('does not authenticate', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["NFC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("");
                  done();
                }
            });
  });
});

describe('/authenticate with correct CID', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["CID"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('does not authenticate', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["CID"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("DummyID");
                  done();
                }
            });
  });
});

describe('/authenticate with incorrect CID', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["CID"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('does not authenticate', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["CID"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("DummyID");
                  done();
                }
            });
  });
});

describe('/authenticate with unknown identification type', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["XXX"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('does not authenticate', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["XXX"],"data": [], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("");
                  done();
                }
            });
  });
});

describe('/authenticate with PIC and PIN', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC", "PIN"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('authenticates correct data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC", "PIN"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("");
                  done();
                }
            });
  });

  it('does not authenticate incorrect data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC", "PIN"],"data": [666, 777], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("");
                  done();
                }
            });
  });
});

describe('/authenticate with CID and PIN', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["CID", "PIN"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('authenticates correct data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["CID", "PIN"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("true");
                  response.body["ClientID"].should.equal("DummyID");
                  done();
                }
            });
  });

  it('does not authenticate incorrect data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["CID", "PIN"],"data": [666, 777], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("true");
                  response.body["ClientID"].should.equal("DummyID");
                  done();
                }
            });
  });
});

describe('/authenticate with NFC and PIN', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["NFC", "PIN"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('authenticates correct data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["NFC", "PIN"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("");
                  done();
                }
            });
  });

  it('does not authenticate incorrect data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["NFC", "PIN"],"data": [666, 777], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("");
                  done();
                }
            });
  });
});

describe('/authenticate with CID and OTP', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["CID", "OTP"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('authenticates correct data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["CID", "OTP"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("123");
                  done();
                }
            });
  });

  it('does not authenticate incorrect data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["CID", "OTP"],"data": [666, 777], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("123");
                  done();
                }
            });
  });
});

describe('/authenticate with NFC and OTP', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["NFC", "OTP"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('authenticates correct data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["NFC", "OTP"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("");
                  done();
                }
            });
  });

  it('does not authenticate incorrect data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["NFC", "OTP"],"data": [666, 777], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("");
                  done();
                }
            });
  });
});

describe('/authenticate with PIC and OTP', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC", "OTP"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('authenticates correct data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC", "OTP"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("123");
                  done();
                }
            });
  });

  it('does not authenticate incorrect data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC", "OTP"],"data": [666, 777], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("123");
                  done();
                }
            });
  });
});

describe('/authenticate with PIC and CID', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC", "CID"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('authenticates correct data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC", "CID"],"data": [123, 456], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("123");
                  done();
                }
            });
  });

  it('does not authenticate incorrect data', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC", "CID"],"data": [666, 777], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("123");
                  done();
                }
            });
  });
});
/*
const assert = require('chai').assert;
const chaiHttp = require('chai-http');
const request = require('request');
const nock = require('nock');
const auth = require('../auth');
const http = require('http');

describe('auth', function () 
{
  describe('Resonse to GET authorization requests', function()
  {
    it('Response with PIN and PIC types', function() 
    {
      var options = {
        host: 'merlot-auth.herokuapp.com',
        port: 80,
        path: "/authenticate",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
      };
      
      var body = "";
      
      var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          //console.log('BODY: ' + chunk);
          body += chunk;
        });
        res.on('end', function () {
          assert.equal('{"Success": "false","ClientID": "","TriesLeft": "3","Timestamp": "' + + '"}', respon);
        });
      });
      
      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      
      req.end();
      /*
      var respon = "";

      let done = false;

      fdescribe('/authenticate with incorrect PIC', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('response did not authenticate', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("123");
                  done();
                }
            });
  });

  it('correctly keeps track of tries left', function(done) 
  {
    //First request
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["TriesLeft"].should.equal("2");
                }
            });
    
    //Second request
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["TriesLeft"].should.equal("2");
                  done();
                }
            });
  });
});ion callback(respon)
      {describe('/authenticate with incorrect PIC', () => {
  it('responds', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.should.have.status(200);
                  done();
                }
            });
  });

  it('response did not authenticate', function(done) 
  {
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["Success"].should.equal("false");
                  response.body["ClientID"].should.equal("123");
                  done();
                }
            });
  });

  it('correctly keeps track of tries left', function(done) 
  {
    //First request
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["TriesLeft"].should.equal("2");
                }
            });
    
    //Second request
    chai.request('merlot-auth.herokuapp.com')
        .get('/authenticate')
        .set('content-type', 'application/json')
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .send({"type": ["PIC"],"data": [123], "ID":1})
        .end(function(error, response, body)
            {
                if (error) 
                {
                  done(error);
                } 
                else
                {
                  response.body["TriesLeft"].should.equal("2");
                  done();
                }
            });
  });
});
        assert.equal('{"Success": "false","ClientID": "","TriesLeft": "3","Timestamp": "' + + '"}', respon);
      }

      request.get(
        {
          headers: { 'Content-Type': 'application/json' },
          url: 'http://merlot-auth.herokuapp.com/authenticate',
          body: '{"type": ["PIC","PIN"],"data": [123,456], "ID":1}'
        }, function(error, response, body)
            {
              if(error)
              throw error;

              respon = body;
              console.log(respon);
              done = true;
              
            });
       
    });
  });
});
*/