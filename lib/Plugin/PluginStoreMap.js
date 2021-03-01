const {PluginStore} = require("./PluginStore.js");

exports.PluginStoreMap = class PluginStoreMap extends PluginStore {
  get(key) {
    return this.map.get(key);
  }
  set(key, val) {
    return this.map.set(key, val);
  }
  has(key) {
    return this.map.has(key);
  }
  delete(key) {
    return this.map.delete(key);
  }
  entries() {
    return this.map.entries ? this.map.entries() : super.entries();
  }
  keys() {
    return this.map.keys();
  }
  values() {
    return this.map.values ? this.map.values() : super.values();
  }
  clear() {
    return this.map.clear();
  }
}