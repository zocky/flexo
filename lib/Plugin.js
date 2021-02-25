const Plugin = exports.Plugin = class Plugin {
  constructor(engine, {...rest}) {
    Object.assign(this,{
      engine,
    })
  }
}

Plugin.Auth = class PluginAuth extends Plugin {
  async authenticate(req) {
    return false;
  }
}

Plugin.Auth.Password = class PluginAuthPassword extends Plugin.Auth {
  async authenticate(req) {
    const {
      [this.userField]:username,
      [this.passField]:password,
    } = req.query;
    if (await this.checkPassword(username,password)) {
      return username;
    }
  }
  async checkPassword() {
    return false;
  }
}