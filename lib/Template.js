const { Frame } = require("./Frame.js");

exports.Template = class Template {
  static register(engine,options) {
    return new this(engine,options);
  }
  _func = (fn, def) => {
    if (fn === undefined) return () => def;
    if (typeof fn !== "function") return () => fn;
    return fn.bind(this);
  }
  _render = null;
  constructor(engine, { template, render, data, helpers = {} }) {
    this.engine = engine;
    this.helpers = Object.create(this.engine.helpers);
    Object.assign(this.helpers,helpers);
    this.proto = {};
    this._render = render;
    this.template = template;
    this.data = data ? this._func(data) : (x=>x);
  }
  render = async (props = {}) => {
    //this.helpers = Object.assign({}, this.engine.helpers, this.helpers);
    let data = await this.data(props);
    if (this._render) return await this._render(data,props);
    const frame = new Frame(this, data);
    await this.template.call(frame, frame);
    return frame.output;
  }
}