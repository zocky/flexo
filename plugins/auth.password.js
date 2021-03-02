const { Plugin } = require("../lib/Plugin")

const bcrypt = require("bcrypt");

exports.Plugin = class AuthPassword extends Plugin.Auth.Password {

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
    this.debug(hash);
    await this.store.set(username, hash);
  }
}