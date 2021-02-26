const NeDB = require('nedb');
const service = require('feathers-nedb');
const Path = require("path");

exports.Plugin = engine => {
  return class PluginStoreFile extends engine.Plugin.Store.Feathers {
    constructor(engine, { file, ...rest }) {
      super(engine, { ...rest });
      const filename = this.filename = Path.resolve(engine.config.dataDirectory,file);
      const Model = this.Model = new NeDB({
        filename,
        autoload: true
      });
      this.db = service({Model});
    }
  }
}
