const Keyv = require('keyv');
const Path = require("path");

exports.Plugin = engine => {
  return class PluginStoreFile extends engine.Plugin.Store.Map {
    constructor(engine, { file, ...rest }) {
      let filename = Path.resolve(engine.config.dataDirectory,file);
      console.log(filename);
      let map = new Keyv('sqlite://'+filename);
      super(engine, { map, ...rest });
      this.filename = filename;
    }
  }
}
