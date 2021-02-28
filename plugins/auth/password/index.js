const bcrypt = require("bcrypt");

exports.Plugin = engine => {
  return class AuthHtpasswd extends engine.Plugin.Auth.Password {
    constructor(engine, { store, ...rest }) {
      super(engine, rest);
      this.store = engine.getOrCreateService(store);
    }
    async checkPassword(username, password) {
      const hash = await this.store.get(username) || "*";
      return await bcrypt.compare(password,hash);
    }
    async setPassword(username,password) {
      const hash = await bcrypt.hash(password,12);
      console.log(hash);
      await this.store.set(username,hash);
    }
  }
}