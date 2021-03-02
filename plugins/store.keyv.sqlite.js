const { Plugin } = require("../lib/Plugin");
const Keyv = require('keyv');
const Path = require("path");

exports.Plugin = class PluginStoreFile extends Plugin.Store.Key {
  settings = {
    ...this.settings,
    file: this.engine.resolveDataPath
  }
  setup () {
    super.setup();
    this.map = new Keyv('sqlite://' + this.settings.file);
  }
}
