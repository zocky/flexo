exports.Plugin = engine => {
  return class PluginStoreMemory extends engine.Plugin.Store.Map {
    constructor(engine, { ...rest }) {
      super(engine, { map: new Map(), ...rest });
    }
  }
}