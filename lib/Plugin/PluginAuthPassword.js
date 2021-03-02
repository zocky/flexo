const { PluginAuth } = require("./PluginAuth.js");

exports.PluginAuthPassword = class PluginAuthPassword extends PluginAuth {
  
  settings = {
    ...this.settings,
    userField: this.check.default('username'),
    passField: this.check.default('password'),
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