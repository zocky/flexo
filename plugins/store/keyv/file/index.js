const Keyv = require('keyv');
const KeyvFile = require('keyv-file').KeyvFile
const Path = require("path");

exports.Plugin = engine => {
  return class PluginStoreFile extends engine.Plugin.Store.Key {
    constructor(engine, { file, ...rest }) {
      super(engine, { ...rest });
      const filename = this.filename = Path.resolve(engine.config.dataDirectory,file);
      this.map = new Keyv({
        store: new KeyvFile({filename})
      });
    }
  }
}
