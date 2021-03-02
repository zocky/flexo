const utils = require('./utils');

exports.Base = class Base {
  assert(test,...args) {
    if (!test) this.throw(...args);
  }
  throw(...args) {
    throw new this.Error(...args);
  }
  static Error = class extends Error {}
  Error = this.constructor.Error
  utils = require('./utils')
  static utils = require('./utils')
  static debug = utils.debug;
  debug = utils.debug;

  static check = utils;
  check = utils;

  #handlers = {};
  on (event, handler) {
    this.#handlers[event] = this.#handlers[event] || [];
    this.#handlers[event].push(handler);
  }
  async trigger(event, ...args) {
    const handlers = this.#handlers[event] || [];
    for (const handler of handlers) {
      await handler.call(this, ...args)
    }
  }

  
}