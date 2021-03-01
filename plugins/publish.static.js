const { PluginPublish } = require("../lib/Plugin")

exports.Plugin = class PublishStatic extends PluginPublish {
  constructor(engine, {
    filepath = null,
    recursive = null,
    ... rest 
  }) {
    super(engine, rest);
    Object.assign(this,{
      filepath:engine.resolvePath(filepath),
      recursive
    })
    this.filepath = filepath;
  }

}
