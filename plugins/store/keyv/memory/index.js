exports.Plugin = engine => {
  return class PluginStoreMemory extends engine.Plugin.Store.Map {
    constructor(engine, { ...rest }) {
      super(engine, { ...rest });
      this.map = new Map();
    }
  }
}