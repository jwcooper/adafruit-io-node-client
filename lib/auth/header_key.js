class HeaderKey  {

  constructor(client) {
    this.client = client;
  }

  apply(obj, authorizations) {

    if(this.client.key)
      obj.headers['X-AIO-Key'] = this.client.key;

    if(typeof window === 'undefined')
      obj.headers['User-Agent'] = `AdafruitIO-Node/${pkg.version} (${process.platform} ${process.arch} ${process.version})`;

    return true;

  }

}

exports = module.exports = HeaderKey;
