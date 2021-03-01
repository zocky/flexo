const { Plugin } = require("../lib/Plugin")

exports.Plugin = class AuthGithub extends Plugin.Auth.Passport {
  constructor(engine, { clientID, clientSecret, callbackURL, ...rest }) {
    super(engine, { ...rest, strategy: {
      Strategy: require('passport-github').Strategy,
      options: { clientID, clientSecret, callbackURL }
    }});
  }
  extractInfo = profile => ({
    userId: profile.id,
    username: profile.username,
    email: profile.email
  })
}
