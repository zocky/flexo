const Keyv = require('keyv');
const KeyvFile = require('keyv-file').KeyvFile
const Path = require("path");

exports.Plugin = engine => {
  return class PluginStoreFile extends engine.Plugin.Store.Map {
    constructor(engine, { file, ...rest }) {
      let filename = Path.resolve(engine.config.dataDirectory,file);
      console.log(filename);
      let map = new Keyv({
        store: new KeyvFile({
          filename
        })
      });
      super(engine, { map, ...rest });
      this.filename = filename;
    }
  }
}
