const crypto = require('crypto'),
      url = require('url'),
      pkg = require('../../package.json');

class Signature {

  constructor(client) {

    this.client = client;

    this.host = false;
    this.method = 'GET';
    this.params = false;
    this.path = false;
    this.parsed = false;

  }

  toString() {

    const step1 = this.hmac(this.key, this.date),
          step2 = this.hmac(step1, this.host),
          step3 = this.hmac(step2, this.method),
          step4 = this.hmac(step3, this.params);

    const signing_key = this.hmac(step4, this.version),
          canonical_request = this.hash(this.request),
          to_sign = `${this.algorithm}\n${this.date}\n${canonical_request}`;

    return this.hmac(signing_key, to_sign);

  }

  apply(obj, authorizations) {

    this.host = obj.headers.Host;
    this.path = obj.url;
    this.method = obj.method;

    obj.headers['X-AIO-Credential'] = this.credential;
    obj.headers['X-AIO-Algorithm'] = this.algorithmName;
    obj.headers['X-AIO-Parameters'] = this.params;
    obj.headers['X-AIO-Date'] = this.date;
    obj.headers['X-AIO-Signature'] = this.toString();

    if(typeof window === 'undefined')
      obj.headers['User-Agent'] = `AdafruitIO-Node/${pkg.version} (${process.platform} ${process.arch} ${process.version})`;

    return true;

  }

  get request() {

    return `${this.method}\n${this.path}?${this.params}\nhost: ${this.host}\nx-aio-date: ${this.date}`;

  }

  get version() {
    return 'aio-signature-v1';
  }

  get credential() {
    return `${this.username}/${this.version}`;
  }

  get date() {
    return (new Date()).toISOString();
  }

  get algorithm() {
    return 'sha512';
  }

  get algorithmName() {
    return `aio-hmac-${this.algorithm}`;
  }

  get path() {
    return this.path;
  }

  set path(path) {

    this.parsed = url.parse(path, true);
    this.params = Object.keys(this.parsed.query).sort().map(q => q.toLowerCase()).join('&');
    this.host = this.parsed.host;
    this.path = this.parsed.href.split('?')[0];

  }

  hash(data) {
    const hash = crypto.createHash(this.algorithm);
    return hmac.update(data).digest('hex');
  }

  hmac(key, data) {
    const hmac = crypto.createHmac(this.algorithm, key);
    return hmac.update(data).digest('hex');
  }

}

exports = module.exports = Signature;
