
exports.Plugin = engine => class AuthGithub extends engine.Plugin.Auth.Passport {
  static requires = ['passport-github'];
  constructor(engine, {
    clientID,
    clientSecret,
    callbackURL,
    ...rest
  }) {
    super(engine, rest);
    
    const GitHubStrategy = require('passport-github').Strategy;
    this.strategy = new GitHubStrategy({
      clientID,
      clientSecret,
      callbackURL
    },
      function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile);
      }
    );
    this.setupRoutes('github');
  }
}
  