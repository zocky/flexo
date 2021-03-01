const { PluginStore } = require("./PluginStore.js");

exports.PluginStoreFeathers = class PluginStoreFeathers extends PluginStore {
  /**
   * Set to a data connector that conforms to the feathers.js common API
   */
  db = null;
  hasService = true;
  service = { 
    ...this.service,
    get : async (id, query) => {
      return await this.db.get(id, { query });
    },
    create : async (data) => {
      return await this.db.create(data);
    },
    update : async (id, data, query) => {
      return await this.db.update(id, data, { query });
    },
    patch : async (ud, data, query) => {
      return await this.db.patch(key, { query });
    },
    remove : async (id, query) => {
      return await this.db.remove(id, { query });
    },
    find : async (query) => {
      return await this.db.find({ query });
    },
    findOne : async (query) => {
      return (await this.db.find({ query }))[0];
    }
  }
}
