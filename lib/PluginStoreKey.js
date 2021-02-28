const { PluginStore } = require("./PluginStore.js");

exports.PluginStoreKey = class PluginStoreKey extends PluginStore {
  get = (key) => {
    return this.map.get(key);
  }
  set = (key, val) => {
    return this.map.set(key, val);
  }
  delete = (key) => {
    return this.map.delete(key);
  }
  clear = () => {
    return this.map.clear();
  }
  service = {
    ...this.service,
    get: this.get,
    set: this.set,
    delete: this.delete,
    clear: this.clear
  }
}