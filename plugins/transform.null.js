
const { PluginTransform } = require("../lib/Plugin/PluginTransform")

const less = require("less");

exports.Plugin = class TransformLess extends PluginTransform {

  settings = {
    ...this.settings,
    extension: x=>x||'txt',
    contentType: 'text/plain'
  }
}
