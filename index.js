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

  constructor(username, key, options) {

    this.host = 'io.adafruit.com';
    this.port = 80;
    this.username = username || false;
    this.key = key || false;
    this.swagger_path = '/api/docs/v2.json';
    this.authorizations = {
      HeaderKey: new HeaderKey(this.key)
    };

    Object.assign(this, options || {});

    let config = {
      usePromise: true,
      authorizations: this.authorizations
    };

    if(typeof window === 'undefined')
      config.url = `http://${this.host}:${this.port}${this.swagger_path}`;
    else
      config.spec = this.spec || API.v2;

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
