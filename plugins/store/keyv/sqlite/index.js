const Keyv = require('keyv');
const Path = require("path");

exports.Plugin = engine => {
  return class PluginStoreFile extends engine.Plugin.Store.Map {
    constructor(engine, { file, ...rest }) {
      super(engine, { ...rest });
      const filename = this.filename = Path.resolve(engine.config.dataDirectory,file);
      this.map = new Keyv('sqlite://'+filename);
    }
  }
}
