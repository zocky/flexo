var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

exports.Plugin = engine => class AuthGithub extends engine.Plugin.Auth.Passport {
  constructor(engine, {
    clientID,
    clientSecret,
    callbackURL,
    ...rest
  }) {
    super(engine, rest);
    console.log(callbackURL);
    this.strategy = new GoogleStrategy({
      clientID,
      clientSecret,
      callbackURL
    },
      function (accessToken, refreshToken, profile, cb) {
        console.log('success2',);
        return cb(null, profile);
      }
    );
    this.setup('google',{scope:[
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]});
  }
}
  