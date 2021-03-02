
const { PluginTransform } = require("../lib/Plugin/PluginTransform")

const less = require("less");

exports.Plugin = class TransformLess extends PluginTransform {

  settings = {
    ...this.settings,
    extension: x=>x||'less',
    contentType: 'text/css'
  }


  transformFile(file, options = {}) {
    return super.transformFile(file, {
      ...options,
      filename: this.engine.resolvePath(file),
    })
  }
  async transform(source, options) {
    return (await less.render(source, options)).css;
  }
}
