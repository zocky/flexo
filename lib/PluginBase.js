exports.PluginBase = class PluginBase {

  static create(engine,options) {
    const it = new this(engine,options);
    it.onCreate(options);
    return it;
  }

  onCreate() {}

  constructor(engine, { name, ...rest }) {
    Object.assign(this, {
      engine,
      name
    })
  }
  
  handlers = {};
  on = (event, handler) => {
    this.handlers[event] = this.handlers[event] || [];
    this.handlers[event].push(handler);
  }
  async trigger(event, ...args) {
    const handlers = this.handlers[event] || [];
    for (const handler of handlers) {
      await handler.call(this, ...args)
    }
  }

  service = {
    on: this.on
  }
}
