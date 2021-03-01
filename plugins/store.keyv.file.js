const { Plugin } = require("../lib/Plugin")
const Keyv = require('keyv');
const KeyvFile = require('keyv-file').KeyvFile
const Path = require("path");

exports.Plugin = class PluginStoreFile extends Plugin.Store.Key {
  constructor(engine, { file, ...rest }) {
    super(engine, { ...rest });
    const filename = this.filename = engine.resolveDataPath(file)
    this.map = new Keyv({
      store: new KeyvFile({ filename })
    });
  }
}
