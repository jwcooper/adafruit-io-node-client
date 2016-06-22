'use strict';

const Swagger = require('./lib/client'),
      Stream = require('./lib/stream'),
      Signature = require('./lib/signature'),
      API = require('io-api'),
      pkg = require('./package.json');

class HeaderKey  {

  constructor(key) {
    this.key = key;
  }

  apply(obj, authorizations) {

    if(this.key)
      obj.headers['X-AIO-Key'] = this.key;

    if(typeof window === 'undefined')
      obj.headers['User-Agent'] = `AdafruitIO-Node/${pkg.version} (${process.platform} ${process.arch} ${process.version})`;

    return true;

  }

}

class Client {

  constructor(options) {

    this.host = 'io.adafruit.com';
    this.port = 80;
    this.username = false;
    this.key = false;
    this.authorizations = {
      HeaderKey: new HeaderKey(this.key)
    };

    Object.assign(this, options || {});

    let config = {
      usePromise: true,
      authorizations: this.authorizations
    };

    let api = this.spec || API.v2;

    if(this.host !== api.host)
      api.host = `${this.host}:${this.port}`;

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

        const stream = new Stream({
          type: api.toLowerCase(),
          username: this.username,
          key: this.key,
          host: this.host,
          port: (this.host === 'io.adafruit.com' ? 8883 : 1883)
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

  static get Signature() {
    return Signature;
  }

  static get Stream() {
    return Stream;
  }

}

exports = module.exports = Client;
