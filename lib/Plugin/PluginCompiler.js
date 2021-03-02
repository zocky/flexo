const fs = require("fs").promises;

const {PluginBase} = require("./PluginBase.js");
exports.PluginCompiler = class PluginCompiler extends PluginBase {
  settings = {
    encoding: "utf-8",
    extension: null,
  }

  service = {
    ...this.service,
    compile: this.compile,
    compileFile: this.compileFile,
    addHelper: this.addHelper
  }

  async addHelper(id,fn) {

  }

  async compileFile(name,file,options={}) {
    const content = await this.readFile(file,options);
    return await this.compile(name,content,options);
  }

  async readFile(file,options={}) {
    file = this.engine.resolvePath(file);
    return await fs.readFile(file,options.encoding || this.settings.encoding);
  }

  compile (name,content,options={}) {
    return ()=>content;
  }
  render (template,data,options) {
    return template(data,options);
  }
}
