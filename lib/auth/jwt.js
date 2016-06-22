const pkg = require('../../package.json');

class JWT {

  constructor(client) {
    this.client = client;
  }

  apply(obj, authorizations) {

    if(this.client.jwt)
      obj.headers['Authorization'] = `Bearer ${this.client.jwt}`;

    if(typeof window === 'undefined')
      obj.headers['User-Agent'] = `AdafruitIO-Node/${pkg.version} (${process.platform} ${process.arch} ${process.version})`;

    return true;

  }

}

exports = module.exports = JWT;
