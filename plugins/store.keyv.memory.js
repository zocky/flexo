const { Plugin } = require("../lib/Plugin")

exports.Plugin = class PluginStoreMemory extends Plugin.Store.Map {
  constructor(engine, { ...rest }) {
    super(engine, { ...rest });
    this.map = new Map();
  }
}