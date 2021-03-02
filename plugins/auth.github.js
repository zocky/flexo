const { Plugin } = require("../lib/Plugin")

exports.Plugin = class AuthGithub extends Plugin.Auth.Passport {

  settings = {
    ...this.settings,
    clientID: String,
    clientSecret: String,
    callbackURL: String,
  }

  setup() {
    const { clientID, clientSecret, callbackURL, scope } = this.settings;
    this.Strategy = require('passport-github').Strategy,
    this.strategyOptions = { clientID, clientSecret, callbackURL };
    super.setup();
  }
  
  extractInfo = profile => ({
    userId: profile.id,
    username: profile.username,
    email: profile.email
  })
}
