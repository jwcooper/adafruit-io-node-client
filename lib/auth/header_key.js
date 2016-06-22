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

exports = module.exports = HeaderKey;
