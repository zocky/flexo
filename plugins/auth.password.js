const { Plugin } = require("../lib/Plugin")

const bcrypt = require("bcrypt");

exports.Plugin = class AuthPassword extends Plugin.Auth.Password {
  constructor(engine, { store, ...rest }) {
    super(engine, rest);
//    this.store = engine.getOrCreateService(store);
  }
  setup() {
    super.setup();
    this.store = this.engine.getOrCreateService(this.conf.store);
  }
  async checkPassword(username, password) {
    const hash = await this.store.get(username) || "*";
    return await bcrypt.compare(password, hash);
  }
  async setPassword(username, password) {
    const hash = await bcrypt.hash(password, 12);
    console.log(hash);
    await this.store.set(username, hash);
  }
}