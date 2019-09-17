'use strict';

const Swagger = require('./lib/client'),
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
      JWT: new JWT(this)
    };

    Object.assign(this, options || {});

    let config = {
      usePromise: this.usePromise,
      authorizations: this.authorizations,
      enableCookies: this.enableCookies
    };

    let api = this.spec || API.v2;

    if(this.host !== api.host)
      api.host = this.host;

    if(! this.ssl)
      api.schemes = ['http'];

    if (options.client)
      config.client = options.client;

    config.spec = api;

    if(this.usePromise) {
      return new Swagger(config).then((client) => {
        this.swagger = client;
        return this;
      });
    }

    this.swagger = new Swagger(config);

    return this;

  }
}

exports = module.exports = Client;
