
const {PluginBase} = require("./PluginBase.js");
exports.PluginPublish = class PluginStore extends PluginPublish {
  constructor(engine, {
    urlpath = null,
    ... rest 
  }) {
    super(engine, rest);
    Object.assign(this,{
      urlpath, 
    })
    this.filepath = filepat
  }
}
