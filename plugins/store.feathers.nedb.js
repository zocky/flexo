const { Plugin } = require("../lib/Plugin")

const NeDB = require('nedb');
const feathersService = require('feathers-nedb');

const Path = require("path");

exports.Plugin = class PluginStoreFile extends Plugin.Store.Feathers {
  constructor(engine, { file, ...rest }) {
    super(engine, { ...rest });
    const filename = this.filename = engine.resolveDataPath(file);
    const Model = this.Model = new NeDB({
      filename,
      autoload: true
    });
    this.db = feathersService({ Model });
  }
}
