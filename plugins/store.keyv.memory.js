const { Plugin } = require("../lib/Plugin")

exports.Plugin = class PluginStoreMemory extends Plugin.Store.Map {
  setup() {
    super.setup();
    this.map = new Map();
  }
}