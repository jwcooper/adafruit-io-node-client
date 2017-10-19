var Client = require('./../index')

var MockHttpClient = require('./support/mock');
var myHttpClient = new MockHttpClient();

myHttpClient.add(
  'POST', '/api/v2/([^/]+)/feeds/([^/]+)/data', {status: 200, body: { id: 1, value: '1' }}
);

// node built-in assertions lib
var assert = require('assert');

var _client = new Client({
  ssl: true,
  host: 'io.adafruit.com',
  client: myHttpClient
});

//
// NOTE: because other tests are wrapped in a Promise, there has to be at least one test
describe('Client', function() {
  it('should exist', function (done) {
    assert.ok(_client);
    done();
  });
});

Promise.resolve(_client).then(function (client) {
  describe('Client', function() {
    describe('#data', function() {
      describe('#create', function () {
        it('should send POST to data API with valid input', function (done) {
          client.data.create({ username: 'test_username', feed_key: 'feed_data', datum: { value: 1 } }).
          then(function (response) {
            assert.equal(1, response['id'])
            done()
          });
        });

        it('should not send POST to data API with invalid input', function (done) {
          client.data.create({ username: 'test_username', feed_key: 'feed_data', data: { value: 1 } }).
          then(function () {
            done(new Error("should not even try to send when given 'data' param"))
          }).
          catch(function (ex) {
            assert.ok(/missing required params: datum/.test(ex), 'expected a warning about datum param missing');
            done();
          });
        })
      })
    })
  })
});
