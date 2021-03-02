const { Plugin } = require("../lib/Plugin")

exports.Plugin = class AuthGoogle extends Plugin.Auth.Passport {

  settings = {
    ...this.settings,
    clientID: String,
    clientSecret: String,
    callbackURL: String,
    scope: (scope = []) => {
      scope = ['auth/userinfo.email', ...scope];
      scope = scope.map(it => this.utils.urlResolve('https://www.googleapis.com', it));
      return scope;
    }
  }

  setup() {
    const { clientID, clientSecret, callbackURL, scope } = this.settings;
    this.Strategy = require('passport-google-oauth').OAuth2Strategy;
    this.strategyOptions = { clientID, clientSecret, callbackURL };
    this.authArgs = [{ scope }]
    super.setup();
  }

  extractInfo = profile => ({
    userId: profile.id,
    username: profile.emails[0].value.split('@')[0],
    email: profile.emails[0].value
  })
}
