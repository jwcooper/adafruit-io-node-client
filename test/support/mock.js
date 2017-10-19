// mock HTTP client for Swagger

module.exports = class MockClient {
  constructor(logger) {
    // this.logger = console.log.bind(console)

    this.responders = {
      'get': [],
      'post': [],
      'put': [],
      'delete': []
    }
  }

  add(method, pathMatcher, response) {
    this.responders[method.toLowerCase()].push([
      // pathMatcher should be a RegExp compatible string
      new RegExp(pathMatcher),
      // response should be an object: { status: ###, body: {} }
      response
    ])
  }

  find(method, url) {
    var responders = this.responders[method.toLowerCase()];
    if (!responders) {
      // console.log("could not find", method, "in", this.responders);
      throw `NO RESPONSE AVAILABLE FOR METHOD ${method}`
    }
    return responders.find((resp) => resp[0].test(url))
  }

  execute(obj) {
    var httpMethod = obj.method;
    var requestHeaders = obj.headers;
    var body = obj.body;
    var url = obj.url;

    if (this.logger) {
      this.logger(`${httpMethod} ${url}`);
      this.logger(JSON.stringify(requestHeaders, '  '));
    }

    var responder = this.find(httpMethod, url)

    if (responder) {
      var path = responder[0],
          response = responder[1];

      if (response.status === 200) {
        obj.on.response(response.body)
      } else {
        obj.on.error(response.body)
      }

      return
    }

    throw `NO RESPONSE AVAILABLE FOR ${httpMethod} ${url}`
  }
}
