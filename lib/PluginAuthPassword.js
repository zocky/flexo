const { PluginAuth } = require("./PluginAuth.js");

exports.PluginAuthPassword = class PluginAuthPassword extends PluginAuth {
  constructor(engine, { userField = "username", passField = "password", ...rest }) {
    super(engine, rest);
    Object.assign(this, {
      userField,
      passField
    })
  }
  async authenticate(req) {
    const {
      [this.userField]: username,
      [this.passField]: password,
    } = req.body;
    if (await this.checkPassword(username, password)) {
      return username;
    }
  }
  async checkPassword(username, password) {
    return false;
  }
}