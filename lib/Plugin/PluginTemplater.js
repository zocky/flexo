const fs = require("fs").promises;
const Path = require("path");
const {PluginBase} = require("./PluginBase.js");
exports.PluginTemplater = class PluginTemplater extends PluginBase {
  settings = {
    ... this.settings,
    helpers: x => x && this.engine.resolvePath(x),
    directory: this.engine.resolvePath,
    compilers: x => [].concat(x)
  }

  
  templates = {};

  service = {
    ...this.service,
    renderTemplate: this.renderTemplate,
    addHelper: this.addHelper,

  }
  helpers = {};
  compilers = {};
  setup() {
    for (const conf of this.settings.compilers) {
      const compiler = this.engine.getOrCreateService(conf);
      this.compilers[compiler.settings.extension] = compiler;
    }
    if (this.settings.helpers) {
      const helpers = require(this.settings.helpers);
      for (const id in helpers) {
        this.addHelper(id,helpers[id]);
      }
    }
  }
  
  addHelper(id,fn) {
    this.assert(!(id in this.helpers),"duplicate helper id "+id);
    this.helpers[id] = fn;
    for (const extension in this.compilers) {
      this.compilers[extension].addHelper(id,fn);
    }
  }

  async renderTemplate(name,context,options) {
    const template = await this.getTemplate(name);
    this.assert(template,"no such template "+name);
    return await template(context,options);
  }

  async getTemplate(name) {
    if (!this.templates[name]) {
      await this.loadTemplate(name);
    }
    return this.templates[name];
  }

  async loadTemplate(name) {
    const found = await this.findTemplate(name);
    this.assert(found,'no template found '+name);
    const {filename,extension,compiler} = found;
    const template = await compiler.compileFile(name,filename);
    this.templates[name]=template;
  }
  async findTemplate(name) {
    const { directory } = this.settings;
    const path =Path.join(directory,name)+".";
    for (const extension in this.compilers ) {
      console.log(extension)
      const filename = path+extension;
      if (this.utils.fileExists(filename)) {
        return {
          name,
          filename,
          extension,
          compiler:this.compilers[extension]
        }
      }
    }
    return null;
  }
}
