
const { PluginCompiler } = require("../lib/Plugin/PluginCompiler")

const handlebars = require("handlebars");

exports.Plugin = class CompilerHandlebars extends PluginCompiler {

  settings = {
    ...this.settings,
    extension: "hbs",
    contentType: 'text/html'
  }
  compile(name,content,options) {
    return handlebars.compile(content,options);
  }

  addHelper(id,fn) {
    const self = this;
    handlebars.registerHelper(id,function(...args) {
      return fn.call(this,args,{})
    })
  }
}
