const {PluginStore} = require("./PluginStore.js");

exports.PluginStoreFeathers = class PluginStoreFeathers extends PluginStore {
  db = null;
  async get(id, query) {
    return await this.db.get(id, { query });
  }
  async create(data) {
    return await this.db.create(data);
  }
  async update(id, data, query) {
    return await this.db.update(id, data, { query });
  }
  async patch(ud, data, query) {
    return await this.db.patch(key, { query });
  }
  async remove(id, query) {
    return await this.db.remove(id, { query });
  }
  async find(query) {
    return await this.db.find({ query });
  }
  async findOne(query) {
    const found = await this.db.find({ query });
    return found && found[0];
  }

  service = {
    ...this.service, 
    create: this.create.bind(this),
    update: this.update.bind(this),
    patch: this.patch.bind(this),
    remove: this.remove.bind(this),
    find: this.find.bind(this),
    findOne: this.findOne.bind(this),
  }
}