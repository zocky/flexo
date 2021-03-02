const { Plugin } = require("../lib/Plugin")

const NeDB = require('nedb');
const feathersService = require('feathers-nedb');

const Path = require("path");

exports.Plugin = class PluginStoreFile extends Plugin.Store.Feathers {
  settings = {
    ...this.settings,
    file: file => this.engine.resolveDataPath(file)
  }

  setup() {
    super.setup()
    const Model = this.Model = new NeDB({ 
      filename: this.settings.file, 
      autoload: true 
    });
    this.db = feathersService({ Model });
  }
}
