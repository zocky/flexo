const { Plugin } = require("../lib/Plugin")

exports.Plugin = class AuthGoogle extends Plugin.Auth.Passport {

  constructor(engine, { clientID, clientSecret, callbackURL, scope = [], ...rest }) {
    scope = [, ...scope].map(
      it => engine.utils.urlResolve('https://www.googleapis.com', it)
    )
    super(engine, { ...rest, strategy: {
      Strategy: require('passport-google-oauth').OAuth2Strategy,
      options: { clientID, clientSecret, callbackURL },
      args: [{ scope }]
    }});

    this.scope = scope;
  }
  

  extractInfo = profile => ({
    userId: profile.id,
    username: profile.emails[0].value.split('@')[0],
    email: profile.emails[0].value
  })
}
