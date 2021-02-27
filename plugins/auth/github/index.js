const GitHubStrategy = require('passport-github').Strategy;

exports.Plugin = engine => class AuthGithub extends engine.Plugin.Auth.Passport {
  constructor(engine, {
    clientID,
    clientSecret,
    callbackURL,
    ...rest
  }) {
    super(engine, rest);
    console.log(callbackURL);
    this.strategy = new GitHubStrategy({
      clientID,
      clientSecret,
      callbackURL
    },
      function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile);
      }
    );
    this.setup('github');
  }
 
}
  