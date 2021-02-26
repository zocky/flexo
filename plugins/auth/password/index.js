const bcrypt = require("bcrypt");

exports.Plugin = engine => {
  return class AuthHtpasswd extends engine.Plugin.Auth.Password {
    constructor(engine, { store, ...rest }) {
      super(engine, rest);
      this.store = engine.loadService(store);
    }
    async checkPassword(username, password) {
      if (!await this.store.has(username)) return false;
      const hash = await this.store.get(username);
      return await bcrypt.compare(password,hash);
    }
    async setPassword(username,password) {
      const hash = await bcrypt.hash(password,12);
      await this.store.set(username,hash);
    }
  }
}