const { PluginStore } = require("./PluginStore.js");

exports.PluginStoreKey = class PluginStoreKey extends PluginStore {
  /**
   * set to an object that can do get, set, delete and clear
   */
  map = null; 
  hasService = true;
  service = {
    ... this.service,
    get: (key) => {
      return this.map.get(key);
    },
    set: (key, val) => {
      return this.map.set(key, val);
    },
    delete: (key) => {
      return this.map.delete(key);
    },
    clear: () => {
      return this.map.clear();
    }
  }
}