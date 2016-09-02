'use strict';

const Swagger = require('./lib/client'),
      Stream = require('./lib/stream'),
      Signature = require('./lib/auth/signature'),
      HeaderKey = require('./lib/auth/header_key'),
      JWT = require('./lib/auth/jwt'),
      API = require('io-api'),
      pkg = require('./package.json');

class Client {

  constructor(options) {

    this.host = 'io.adafruit.com';
    this.username = false;
    this.key = false;
    this.ssl = true;
    this.usePromise = true;
    this.authorizations = {
      HeaderKey: new HeaderKey(this),
      Signature: new Signature(this),
      JWT: new JWT(this)
    };

    Object.assign(this, options || {});

    let config = {
      usePromise: this.usePromise,
      authorizations: this.authorizations
    };

    let api = this.spec || API.v2;

    if(this.host !== api.host)
      api.host = this.host;

    if(! this.ssl)
      api.schemes = ['http'];

    config.spec = api;

    return new Swagger(config).then((client) => {
      this.swagger = client;
      this._defineGetters();
      return this;
    });

  }

  _defineGetters() {

    Object.keys(this.swagger.apis).forEach(api => {

      if(api === 'help')
        return;

      const connect = (username = false, id) => {

        const password = this.key || this.jwt

        const stream = new Stream({
          type: api.toLowerCase(),
          username: this.username,
          key: password,
          host: this.host,
          port: (this.ssl ? 8883 : 1883)
        });

        stream.connect(username, id);

        return stream;

      };

      this.swagger[api].readable = connect;
      this.swagger[api].writable = connect;
      this.swagger[api].stream = connect;

      // add dynamic getter to this class for the API
      Object.defineProperty(this, api.toLowerCase(), {
        get: () => {
          return this.swagger[api];
        }
      });

    });

  }

}

exports = module.exports = Client;
