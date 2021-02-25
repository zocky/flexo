

module.exports.Frame = class Frame {
  data = null;
  output = "";
  vars = {};
  constructor(template, data, vars = {}) {
    this.template = template;
    this.data = data;
    this.vars = vars;
  }
  childFrame(data = {}) {
    return new Frame(this.template, Object.assign({}, data));
  }
  extendedFrame(vars = {}) {
    const extendedVars = Object.assign({}, this.vars, vars);
    
    return new Frame(
      this.template,
      this.data,
      extendedVars,
    );
  }

  GET = async (...keys) => {
    var it = await this._GET(keys);
    if (typeof it === 'function') it = await it.call(this.data, [], {});
    return it;
  }
  _GET = async ([head, ...tail]) => {
    var it;
    if (head === "this") {
      it = this.data;
    } else if (head in this.vars) {
      it = this.vars[head];
    } else if (head in this.template.helpers) {
      it = this.template.helpers[head];
    } else {
      it = this.data[head];
    }
    for (const key of tail) {
      if (!it) return it;
      if (typeof it === 'function') it = await it.call(this.data, [], {});
      it = it[key];
    }
    return it;
  }
  PRINT = (str) => {
    this.output += escapeHTML(str);
  }
  RAW = (str) => {
    this.output += str;
  }
  HELPER = async (name, numbered, named) => {
    const it = this.template.helpers[name];
    if (typeof it === 'function') return it.call(this.data, numbered,named, this);
    throw "bad helper " + name;
  }
  PARTIAL = async (name, context = this.data) => {
    this.output += await this.template.engine.render(name, context);
  }
  WITH = async (named, thenBlock) => {
    const frame = this.extendedFrame(named);
    await thenBlock.call(frame, frame);
    this.output += frame.output;
  }
  EACH = async (items, id, thenBlock, elseBlock) => {
    if (!items || typeof items != "object") {
      return elseBlock ? await elseBlock.call(this, this) : "";
    }
    if (id) {
      const frame = this.extendedFrame();
      //TODO: make it a variable, when "#with" is done
      for (const key in items) {
        frame.data[id] = items[key];
        await thenBlock.call(frame, frame);
      }
      this.output += frame.output;
    } else {
      const frame = this.childFrame({}, this.vars);
      for (const key in items) {
        frame.data = items[key];
        await thenBlock.call(frame, frame);
      }
      this.output += frame.output;
    }
  }
  async EACHOF(items, thenBlock, elseBlock) {
    if (!items || typeof items != object) {
      return elseBlock ? await elseBlock : "";
    }

  }

}

function escapeHTML(str) {
  if (!str && str !== 0) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}