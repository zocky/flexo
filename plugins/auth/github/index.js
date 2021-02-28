
exports.Plugin = engine => class AuthGithub extends engine.Plugin.Auth.Passport {
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
