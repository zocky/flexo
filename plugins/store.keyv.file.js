const { Plugin } = require("../lib/Plugin")
const Keyv = require('keyv');
const KeyvFile = require('keyv-file').KeyvFile
const Path = require("path");

exports.Plugin = class StoreKeyvFile extends Plugin.Store.Key {
  
  settings = {
    ...this.settings,
    file: this.engine.resolveDataPath
  }
  setup() {
    super.setup();
    this.map = new Keyv({
      store: new KeyvFile({ filename:this.settings.file })
    });
  }
}
